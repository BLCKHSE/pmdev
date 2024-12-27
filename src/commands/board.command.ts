import path from 'path';
import fs from 'fs';

import { window, ExtensionContext } from 'vscode';

import { Board, Platform, PlatformHelper } from '../dtos/board.dto';
import { Trello } from '../integrations/trello';
import { Member } from '../dtos/member.dto';
import { General } from '../dtos/general.dto';
import { createStorageDirectory } from '../utils/file';
import { getLogTimestamp } from '../utils/date';
import { ProjectBoardProvider } from '../providers/project-board.provider';


/**
 * Project board commands
 */
export class BoardCommand {

    private static  _filenameTemplateSuffixLength = 12;

    /**
     * Adds project board
     * @param context ExtensionContext
     */
    static addBoard = async (storagePath: string,  context?: ExtensionContext) => {
        console.log(`${getLogTimestamp()}: addBoard:i01[MSG]Add Board Initiated`);
        const platform: string | undefined = await window.showQuickPick([Platform.TRELLO,]);
        console.info(`addBoard:i02[MSG]${platform} selected`);

        const platformProcessor =  new Trello();
        let member: Member | null = null;
        try {
            createStorageDirectory(storagePath);
            await platformProcessor.loadCredentials(context);
            await platformProcessor.verifyToken(context);
            member = await platformProcessor.getMember();
        } catch(err) {
            console.error(`${getLogTimestamp()}: addBoard:e01[MSG]Failed to verify provided token`);
            return;
        };
        const boards: Board[] | null = await platformProcessor.getBoards();
        if (!boards) {
            window.showErrorMessage(`Failed to fetch ${platform} boards, confirm you have valid credentials and access`);
            return;
        }
        // Get Lists & cards
        for (const board of boards) {
            board.lists = await platformProcessor.getLists(board.id) ?? [];
            board.cards = await platformProcessor.getCards(board.id) ?? [];
            board.tags = await platformProcessor.getTags() ?? {};
            board.organization = await platformProcessor.getOrganization(board?.organization?.id ?? '') ?? [];
        }
        // save boards to storage
        const key: string = platform?.toLocaleLowerCase() ?? Platform.TRELLO;
        const filePath: string = path.join(storagePath, `${key}-boards.json`);
        const general: General = new General(boards, PlatformHelper.toPlatform(platform), member, key);
        fs.writeFile(filePath, general.toString(), {flag: 'w'}, err => {
            if (err) {
                console.error(`${getLogTimestamp()}: addBoard:e01[MSG]Failed to add project board data -> ${err}`);
                window.showErrorMessage(`Failed to add ${platform} Project Board data: ${err.message}`);
            } else {
                window.createTreeView('my-project-boards', {treeDataProvider: new ProjectBoardProvider([general,], context?.extensionPath ?? '')});
                window.showInformationMessage(`${platform} Project Board data successfully added!`);
            }
        });
        // TODO: Add treeView of boards in activity panel
    };

    static clearBoards = async (boardId?: string) => {
        // TODO: IMplement clear board
    };

    /**
     * Loads local boards
     * @param storagePath 
     * @returns 
     */
    static getBoardsLocal = async (storagePath: string): Promise<General[]> => {
        let boards: General[] = [];
        const files: string[] = fs.readdirSync(storagePath);
        if (storagePath && files) {
            for (const file of files) {
                const general: General = JSON.parse(fs.readFileSync(`${storagePath}/${file}`, 'utf-8'));
                const cacheKey: string = file.substring(0, file.length - BoardCommand._filenameTemplateSuffixLength);
                general.key = cacheKey;
                boards.push(general);
            }
        }
        return boards;
    };

}
