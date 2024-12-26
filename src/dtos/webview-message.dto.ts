import { Board } from "./board.dto";
import { Card } from "./card.dto";
import { Member } from "./member.dto";

export type MessageType = 'API_2_WEB' | 'WEB_2_API';

export type Message = {
    type: MessageType,
    board?: Board;
    card?: Card;
    member: Member;
};
