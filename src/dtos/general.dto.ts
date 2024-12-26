import { Board, Platform } from "./board.dto";
import { Member } from "./member.dto";

export class General {

    boards: Board[];
    creationDate: Date;
    key: string;
    lastUpdated: Date;
    member: Member | null;
    platform: Platform;

    constructor(bpards: Board[], platform: Platform, member: Member | null, key: string) {
        this.boards = bpards;
        this.creationDate = new Date();
        this.key = key;
        this.lastUpdated = new Date();
        this.member = member;
        this.platform = platform;
    }

    /**
     * Converts General object into JSON string
     * @returns string
     */
    toString = (): string => {
        return JSON.stringify(this);
    };

};
