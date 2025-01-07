import { Action } from "./action.dto";
import { Board } from "./board.dto";
import { Card } from "./card.dto";
import { GeneralError } from "./error.dto";
import { Member } from "./member.dto";

export type MessageType = 'BOARD_LOAD' | 'CARD_UPDATE' | 'CARD_UPDATE_RESP' | 'GET_COMMENTS';

export type Message = {
    type: MessageType,
    actions?: Action[],
    board?: Board,
    card?: Card,
    error?: GeneralError,
    member: Member,
};
