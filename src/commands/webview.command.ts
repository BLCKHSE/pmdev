import fs from 'fs';
import path from "path";

import { ExtensionContext, Uri, ViewColumn, WebviewPanel, window } from "vscode";

import { BoardCommand } from "./board.command";
import { Board, Platform } from "../dtos/board.dto";
import { General } from "../dtos/general.dto";
import { WebviewDTO } from '../dtos/webview.dto';
import { Message } from '../dtos/webview-message.dto';
import { Member } from '../dtos/member.dto';
import { Card } from '../dtos/card.dto';
import { Trello } from '../integrations/trello';
import { GeneralError } from '../dtos/error.dto';
import { Action } from '../dtos/action.dto';

/**
 * Webview panel commands
 */
export class WebViewCommand {

    board: Board | undefined;
    activePanel?: WebviewPanel;
    context?: ExtensionContext;
    extensionUri: Uri;
    extensionPath: string;
    member?: Member;
    storagePath: string;

    constructor(context: ExtensionContext, board?: Board, Member?: Member) {
        this.board = board;
        this.context = context;
        this.extensionPath = context.extensionPath;
        this.extensionUri = context.extensionUri;
        this.member = this.member;
        this.storagePath = context.globalStorageUri.fsPath;
    }

    /**
     * Gets nonce used for security policies
     * @returns string
     */
    _getNonce = () => {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    /**
     * Gets relevant platfrom processor for board
     * @returns 
     */
    _getPlatformProcessor = async () => {
        let platformProcessor;
        switch (this.board?.platform) {
            case Platform.TRELLO:
                platformProcessor = new Trello();
                break;
            default:
                platformProcessor = new Trello();
                break;
        }
        await platformProcessor.loadCredentials(this.context);
        return platformProcessor;
    };

    /**
     * Replaces html variables
     * @param html 
     * @param webview 
     * @returns 
     */
    _processHtmlContent = (html: string, webview: WebviewDTO): string => {
        if (!webview) {
            return html;
        }
        for (const key in webview) {
            const value = webview[<keyof WebviewDTO>key];
            html = html.replaceAll(`\{\{${key}\}\}`, value as string);
        }
        return html;
    };

    /**
     * Get actions/history for a specified card. Can also include card comments for platforms like Trello
     * @param idCard {string}
     * @param filter {string}
     */
    getComments = async (idCard?: string, filter?: string) => {
        let actions: Action[] = [];
        if (idCard) {
            const platformProcessor = await this._getPlatformProcessor();
            filter = !filter && platformProcessor.platform === Platform.TRELLO ? 'commentCard' : filter;
            actions = await platformProcessor.getActions(idCard, filter) ?? [];
        }
        this.activePanel?.webview.postMessage(<Message>{
            type: 'GET_COMMENTS',
            actions: actions
        });
    };

    /**
     * Handles webview messages
     * @param message {Message}
     */
    handleWebViewMessage = (message: Message) => {
        switch (message.type) {
            case 'CARD_UPDATE':
                this.processCardUpdate(message?.card);
                break;
            case 'GET_COMMENTS':
                this.getComments(message?.card?.id);
                break;
            default:
                break;
        }
    };

    /**
     * Opens a webview panel with the project boards UI
     * @param boardId 
     * @param platform 
     * @param activePanel 
     * @param title 
     */
    openWebViewPanel = async (
        boardId?: string,
        title?: string,
        platform: Platform = Platform.TRELLO
    ) => {
        if (!!boardId) {
            const localBoards: General[] | null = await BoardCommand.getBoardsLocal(this.storagePath ?? '');
            const boardGroup: General[] = localBoards.filter(boardGrp => boardGrp.platform === platform);
            this.board = boardGroup[0]?.boards.filter(board => board.id === boardId)[0] ?? this.board;
            this.member = boardGroup[0]?.member || undefined;
        }

        if (this.activePanel) {
            this.activePanel.reveal(window.activeTextEditor?.viewColumn);
            this.activePanel.title = title || 'Your Borads';
        } else {
            this.activePanel = window.createWebviewPanel(
                'kanbanBoard', 
                title || '',
                window.activeTextEditor?.viewColumn || ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: [Uri.joinPath(this.extensionUri, 'resources')]
                }
            );
            this.activePanel.iconPath = {
                light: Uri.file(path.join(this.extensionPath, 'resources/icons', 'board-icon-light.svg')),
                dark: Uri.file(path.join(this.extensionPath, 'resources/icons', 'board-icon-dark.svg')),
            };
        }
		const scriptUri: Uri = this.activePanel.webview.asWebviewUri(Uri.joinPath(this.extensionUri, 'resources/scripts', 'main.js'));
		const styleUri:Uri = this.activePanel.webview.asWebviewUri(Uri.joinPath(this.extensionUri, 'resources/style', 'main.css'));
        const htmlContent: string = fs.readFileSync(path.join(this.extensionPath, 'resources/html', 'index.html'), 'utf-8');
        this.activePanel.webview.html = this._processHtmlContent(
            htmlContent,
            {
                cspSource: this.activePanel.webview.cspSource,
                nonce: this._getNonce(),
                scriptUri: scriptUri,
                styleUri: styleUri,
                title: this.board?.name ?? 'Your Boards'
            }
        );
        this.activePanel.webview.postMessage(<Message>{
            type: 'BOARD_LOAD',
            board: this.board,
            member: this.member,
        });
        this.activePanel.webview.onDidReceiveMessage((message: Message) => this.handleWebViewMessage(message));
    };

    processCardUpdate = async (card: Card | undefined) => {
        console.log('update card message: ', card);
        if (!card) {return;}
        const platformProcessor = await this._getPlatformProcessor();
        const res = await platformProcessor.updateCard(card);
        if (res instanceof GeneralError) {
            window.showErrorMessage(`\u{1F954} Failed to update card: ${res.description}`);
            this.activePanel?.webview.postMessage(<Message>{
                type: 'CARD_UPDATE_RESP',
                card: card,
                error: res as GeneralError,
            });
        } else {
            const cardId = card.id;
            let general: General = await BoardCommand.getBoardsLocalByPlatform(this.storagePath, this.board?.platform ?? Platform.TRELLO);
            if (this.board?.cards) {
                const cardIndex = this.board?.cards?.findIndex(card => card.id === cardId);
                if (cardIndex > 0) {
                    this.board.cards[cardIndex] = res;
                    const boardIndex = general.boards.findIndex(board => board.id === this.board?.id);
                    boardIndex > 0 ? general.boards[boardIndex] = this.board : '';
                }
                BoardCommand.saveBoard(this.context, path.join(this.storagePath, `${this.board.platform?.toLowerCase()}-boards.json`), general, true);
            }
            window.showInformationMessage(`\u{1F953} Successfully updated card: ${card.id}`);
        }
    };

}
