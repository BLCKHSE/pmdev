import { Board as TrelloBoard } from '../dtos/trello.dto';
import { Card } from './card.dto';
import { List } from './list.dto';
import { Organization } from './organization.dto';
import { Tag } from './tag.dto';
import { User } from './user.dto';

/**
 * General project class
 */
export class Board {
    cards?: Card[];
    creator?: User;
    description: string;
    id: string;
    lastActivityDate: Date;
    lastViewDate: Date;
    lists?: List[];
    platform?: Platform;
    members?: User[];
    name: string;
    organization?: Organization;
    pinned: boolean;
    tags?: {[key: string]: Tag};
    url: string;

    constructor(board: TrelloBoard) {
        this.id = board.id;
        this.platform = Platform.TRELLO;
        this.description = board.desc;
        this.lastActivityDate = board.dateLastActivity;
        this.lastViewDate = board.dateLastView;
        this.members = board.memberships.map(mem => new User(mem));
        this.name = board.name;
        if (board.organization) {
            this.organization = new Organization(board.organization.id, board.organization.name, board.organization.displayName);
        } else {
            this.organization = new Organization(board.idOrganization);
        }
        this.pinned = board.pinned;
        this.url = board.url;
    }
};

export enum Platform {
    LOCAL = 'LOCAL',
    TRELLO = 'TRELLO'
};

export class PlatformHelper {
    static toPlatform = (platform: string | undefined): Platform => {
        let platformVal;
        platform = platform?.toUpperCase();
        switch (platform) {
            case 'LOCAL':
                platformVal = Platform.LOCAL;
                break;
            default:
                platformVal = Platform.TRELLO;
                break;
        }
        return platformVal;
    };
}
