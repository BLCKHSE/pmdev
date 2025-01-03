import { MembershipItem } from "./external/trello.dto";

export class Member {
    avatarUrl?: string;
    lastActiveDate?: Date;
    email?: string;
    fullName?: string;
    id: string;
    username?: string;

    constructor(member: MembershipItem) {
        this.avatarUrl = member.avatarUrl;
        this.id = member?.id ?? member.idMember;
        this.lastActiveDate= member.dateLastActive;
        this.email = member.email;
        this.fullName = member.fullName;
        this.username = member.username;
    }
};
