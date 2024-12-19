import path from 'path';
import fs from 'fs';

import { window, ExtensionContext } from 'vscode';

import { Board, Platform, PlatformHelper } from '../dtos/board.dto';
import { Trello } from '../integrations/trello';
import { Member } from '../dtos/member.dto';
import { General } from '../dtos/general.dto';
import { createStorageDirectory } from '../utils/file';
import { getLogTimestamp } from '../utils/date';


/**
 * Project Board commands
 */
export class BoardCommand {

    /**
     * Adds project board
     * @param context ExtensionContext
     */
    static addBoard = async (storagePath: string,  context?: ExtensionContext) => {
        console.log(`${getLogTimestamp()} :addBoard:i01[MSG]Add Board Initiated`);
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
            board.organization = await platformProcessor.getOrganization(board?.organization?.id ?? '') ?? [];
        }
        // save boards to storage
        const filePath: string = path.join(storagePath, `${platform?.toLocaleLowerCase()}-boards.json`);
        const general: General = new General(boards, PlatformHelper.toPlatform(platform), member);
        fs.writeFile(filePath, general.toString(), {flag: 'w'}, err => {
            if (err) {
                console.error(`${getLogTimestamp()}: addBoard:e01[MSG]Failed to add project board data -> ${err}`);
                window.showErrorMessage(`Failed to add ${platform} Project Board data: ${err.message}`);
            } else {
                window.showInformationMessage(`${platform} Project Board data successfully added!`);
            }
        });
        // Add treeView of boards in activity panel
    };

}
