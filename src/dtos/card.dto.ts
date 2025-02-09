import { Card as TrelloCard } from './external/trello.dto';

/**
 * General Card class
 */
export class Card {

    closed: boolean;
    commentCount?: number;
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
    tags?: string[];
    url: string;

    constructor(card: TrelloCard) {
        this.closed = card.closed;
        this.commentCount = card?.badges.comments;
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
        this.tags = card.idLabels;
        this.url = card.url;
    }

};
