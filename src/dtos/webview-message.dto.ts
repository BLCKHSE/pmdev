import { Board } from "./board.dto";
import { Card } from "./card.dto";
import { GeneralError } from "./error.dto";
import { Member } from "./member.dto";

export type MessageType = 'BOARD_LOAD' | 'CARD_UPDATE' | 'CARD_UPDATE_RESP';

export type Message = {
    type: MessageType,
    board?: Board;
    card?: Card;
    error?: GeneralError;
    member: Member;
};
