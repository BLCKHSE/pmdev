import fs from 'fs';
import { commands, ExtensionContext, Disposable, window }from 'vscode';

import { BoardCommand } from './commands/board.command';
import { WebViewCommand } from './commands/webview.command';
import { ProjectBoardProvider } from './providers/project-board.provider';
import { getLogTimestamp } from './utils/date';
import { General } from './dtos/general.dto';


export const activate = async (context: ExtensionContext) => {
	console.log(`${getLogTimestamp()}: PMDEV is now active!`);

	const storagePath = context.globalStorageUri.fsPath;
	let boards: General[] | null = [];
	if(fs.existsSync(storagePath)) {
		boards = await BoardCommand.getBoardsLocal(storagePath);
	}

	const projectBoardProvider: ProjectBoardProvider = new ProjectBoardProvider(boards, context.extensionPath);
	window.registerTreeDataProvider('my-project-boards', projectBoardProvider);

	const webViewCommand = new WebViewCommand(context);

	const addBoardDisposable : Disposable = commands.registerCommand('pmdev.addBoard', () => {BoardCommand.addBoard(storagePath, context);});
	const  openWebViewPanel: Disposable = commands.registerCommand('pmdev.open', (boardId, title) => {webViewCommand.openWebViewPanel(boardId, title);});

	context.subscriptions.concat([
		addBoardDisposable,
		openWebViewPanel,
	]);

};

// This method is called when your extension is deactivated
export const deactivate = async () => {};
