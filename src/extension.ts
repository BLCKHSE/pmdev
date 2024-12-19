import {commands, ExtensionContext, Disposable, window }from 'vscode';

import { BoardCommand } from './commands/board.command';
import { getLogTimestamp } from './utils/date';
import { ProjectBoardProvider } from './providers/project-board.provider';

export function activate(context: ExtensionContext) {
	console.log(`${getLogTimestamp()}: PMDEV is now active!`);

	const storagePath = context.globalStorageUri.fsPath;
	const projectBoardProvider: ProjectBoardProvider = new ProjectBoardProvider(storagePath);
	window.registerTreeDataProvider('my-project-boards', projectBoardProvider);

	const addBoardDisposable : Disposable = commands.registerCommand('pmdev.addBoard', () => {BoardCommand.addBoard(storagePath, context);});
	const refresh: Disposable = commands.registerCommand('pmdev.refresh', () => projectBoardProvider.refresh());

	context.subscriptions.concat([
		addBoardDisposable,
		refresh,
	]);
}

// This method is called when your extension is deactivated
export function deactivate() {}
