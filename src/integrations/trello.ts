import { ExtensionContext, window, workspace, WorkspaceConfiguration } from 'vscode';

import {
    Card as TrelloCard,
    List as TrelloList,
    Board as TrelloBoard,
    Organization as TrelloOrganization,
    MembershipItem,
    Token
} from "../dtos/trello.dto";
import { Board } from '../dtos/board.dto';
import { List } from '../dtos/list.dto';
import { Card } from '../dtos/card.dto';
import { Organization } from '../dtos/organization.dto';
import { Member } from '../dtos/member.dto';
import { getLogTimestamp } from '../utils/date';

export class Trello {

    baseUrl = 'https://api.trello.com/1';
    boardsUri = '/members/me/boards';
    cardsUri = '/boards/{boardId}/cards';
    listsUri = '/boards/{boardId}/lists';
    memberUri = '/tokens/{token}/member';
    memberId: string | undefined;
    organisationUri = '/organizations/{orgId}';
    tokensUri = '/tokens/{token}';
    tokenKey = 'trello_token';
    token: string | undefined;

    /**
     * Get Trello boards related to user tied to stored token
     */
    getBoards = async (id?: string): Promise<Board[] | null> => {
        const url = `${this.baseUrl}${this.boardsUri}${!!id ? '/' + id : ''}?key=${process.env.TRELLO_API_KEY}&token=${this.token}`;
        const boards: any = await fetch(url)
            .then(res => res.json())
            .catch(e => {
                console.error(`${getLogTimestamp()}: getBoards:e01[MSG]Failed to fetch Trello boards -> ${e}`);
            });
        if (boards?.id) {
            return [new Board(boards)];
        }
        return (<TrelloBoard[]>boards).map(board => new Board(board)) ?? null;
    };

    /**
     * Get all cards belonging to a board using boardId
     * @param boardId 
     * @param cardId 
     * @returns 
     */
    getCards = async (boardId: string, cardId?: string): Promise<Card[] | null> => {
        const cardsUri = this.cardsUri.replace('\{boardId\}', boardId);
        const url = `${this.baseUrl}${cardsUri}${!!cardId ? '/' + cardId : ''}?key=${process.env.TRELLO_API_KEY}&token=${this.token}`;
        const cards: any = await fetch(url)
            .then(res => res.json())
            .catch(e => {
                console.error(`${getLogTimestamp()}: getCards:e01[MSG]Failed to fetch Trello board(${boardId}) lists -> ${e}`);
            });
        if (cards?.id) {
            return [new Card(cards)];
        }
        return (<TrelloCard[]>cards)
            .filter(card => card.idMembers?.length === 0 || card.idMembers?.includes(this.memberId ?? ''))
            .map(card => new Card(card)) ?? null;
    };

    /**
     * Fetches list(s) for a specified board.
     * Lists are represented as the various columns on a board eg. 'To Do', 'Doing', etc.
     * @param boardId
     * @param listId 
     * @returns 
     */
    getLists = async (boardId: string, listId?: string): Promise<List[] | null> => {
        const listsUri = this.listsUri.replace('\{boardId\}', boardId);
        const url = `${this.baseUrl}${listsUri}${!!listId ? '/' + listId : ''}?key=${process.env.TRELLO_API_KEY}&token=${this.token}`;
        const lists: any = await fetch(url)
            .then(res => res.json())
            .catch(e => {
                console.error(`${getLogTimestamp()}: getLists:e01[MSG]Failed to fetch Trello board(${boardId}) lists -> ${e}`);
            });
        if (lists?.id) {
            return [new List(lists.id, lists.name)];
        }
        return (<TrelloList[]>lists).map(list => new List(list.id, list.name)) ?? null;
    };

    /**
     * Gets member details usimng saved token
     * @param id 
     * @returns 
     */
    getMember = async (id?: string): Promise<Member | null> => {
        const memberUri = this.memberUri.replace('\{token\}', this?.token ?? '');
        const url = `${this.baseUrl}${memberUri}?key=${process.env.TRELLO_API_KEY}`;
        let member: any = await fetch(url)
            .then(res => res.json())
            .catch(e => {
                console.error(`${getLogTimestamp()}: getMember:e01[MSG]Failed to fetch Member(token:${this?.token}) -> ${e}`);
            });
        member = <MembershipItem>member;
        this.memberId = member.id;
        return new Member(member);
    };

    /**
     * Gets organization
     * @param orgId 
     * @returns `Promise<Organization>`
     */
    getOrganization = async (orgId: string): Promise<Organization> => {
        const organisationUri = this.organisationUri.replace('\{orgId\}', orgId);
        const url = `${this.baseUrl}${organisationUri}?key=${process.env.TRELLO_API_KEY}&token=${this.token}`;
        let org: any = await fetch(url)
            .then(res => res.json())
            .catch(e => {
                console.error(`${getLogTimestamp()}: getOrganization:e01[MSG]Failed to fetch Trello organisation(${orgId}) -> ${e}`);
            });
        org = <TrelloOrganization>org;
        return new Organization(org.id, org.name, org.displayName);
    };

    /**
     * Gets saved Trello token or prompts use for new one.
     * @returns api token
     */
    loadCredentials = async (context?: ExtensionContext) => {
        if (!!this.token) {
            return;
        }
        const token = await context?.secrets.get(this.tokenKey).then(token => token);
        const config: WorkspaceConfiguration =  workspace.getConfiguration('pmdev');
        this.token = config.get('trello.token') ?? token;
        if (!this.token) {
            this.token = await window.showInputBox({
                prompt: 'Enter Your Trello Token',
                title: 'Trello Token',
            });
            if (!!this.token) {
                window.showInformationMessage('Trello token added successfully');
            }
        }
        context?.secrets.store(this.tokenKey, this.token ?? '');
    };

    /**
     * Checks that valid Trello api token provided
     * @param token 
     */
    verifyToken = async (context?: ExtensionContext) => {
        const tokensUri = this.tokensUri.replace('\{token\}', this?.token ?? '');
        const url = `${this.baseUrl}${tokensUri}?key=${process.env.TRELLO_API_KEY}`;
        let tokenObj: any = await fetch(url)
            .then(res => res.json())
            .catch(e => {
                console.error(`${getLogTimestamp()}: verifyToken:e01[MSG]Failed to verify Trello token -> ${e}`);
            });
        tokenObj = tokenObj as Token;
        if (!tokenObj || tokenObj && tokenObj.dateExpires > new Date()) {
            context?.secrets.delete(this.tokenKey);
            throw new Error('Invalid token provided');
        }
    };

}
