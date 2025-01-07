import { Member } from "./member.dto";
import { Action as TrelloAction } from "./external/trello.dto";

export type ActionType = 'commentCard' | 'updateCard';

export class Action {

    id: string;
    member: Member;
    text: string;
    type: string;
    date: Date;

    constructor(action: TrelloAction) {
        this.date = action.date;
        this.id = action.id;
        const creator = action.memberCreator;
        this.member = new Member({id: creator.id, avatarUrl: creator.avatarUrl, fullName: creator.fullName, idMember: creator.id, username: creator.username, deactivated: creator.activityBlocked});
        this.text = action.data.text;
        this.type = action.type;
    }
}
