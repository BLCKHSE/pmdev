import { Card as TrelloCard } from './trello.dto';

/**
 * General Card class
 */
export class Card {

    closed: boolean;
    dueComplete: boolean;
    dateLastActivity?: string;
    description: string;
    due?: string;
    dueReminder?: string;
    email?: string;
    id: string;
    idList?: string;
    idMembers?: string[];
    name: string;
    pinned: boolean;
    position: number;
    start?: string;
    subscribed: boolean;
    url: string;

    constructor(card: TrelloCard) {
        this.closed = card.closed;
        this.dateLastActivity = card.dateLastActivity;
        this.description = card.desc;
        this.dueComplete = card.dueComplete;
        this.id = card.id;
        this.idList = card.idList; 
        this.idMembers = card.idMembers;
        this.name = card.name;
        this.pinned = card.pinned;
        this.start = card.start;
        this.position = card.pos;
        this.email = card.email;
        this.subscribed = card.subscribed;
        this.url = card.url;
    }

};
