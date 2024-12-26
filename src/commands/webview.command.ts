import fs from 'fs';
import path from "path";

import { ExtensionContext, Uri, ViewColumn, WebviewPanel, window } from "vscode";

import { BoardCommand } from "./board.command";
import { Board, Platform } from "../dtos/board.dto";
import { General } from "../dtos/general.dto";
import { WebviewDTO } from '../dtos/webview.dto';
import { Message } from '../dtos/webview-message.dto';
import { Member } from '../dtos/member.dto';

/**
 * Webview panel commands
 */
export class WebViewCommand {

    board: Board | undefined;
    activePanel?: WebviewPanel;
    extensionUri: Uri;
    extensionPath: string;
    member?: Member;
    storagePath: string;

    constructor(context: ExtensionContext, board?: Board, Member?: Member) {
        this.board = board;
        this.extensionPath = context.extensionPath;
        this.extensionUri = context.extensionUri;
        this.member = this.member;
        this.storagePath = context.globalStorageUri.fsPath;;
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
     * Replaces html variables
     * @param html 
     * @param webview 
     * @returns 
     */
    __processHtmlContent = (html: string, webview: WebviewDTO): string => {
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
        this.activePanel.webview.html = this.__processHtmlContent(
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
            type: 'API_2_WEB',
            board: this.board,
            member: this.member,
        });
    };

}
