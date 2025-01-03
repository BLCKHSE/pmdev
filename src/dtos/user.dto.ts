import { MembershipItem } from "./external/trello.dto";

export class User {
    avatarUrl?: string;
    dateLastActive?: Date;
    id: string;
    name?: string;
    email?: string;
    type?: string;
    username?: string;

    constructor(membership: MembershipItem) {
        this.avatarUrl = membership.avatarUrl;
        this.email = membership.email;
        this.id = membership.idMember;
        this.dateLastActive = membership.dateLastActive;
        this.name = membership.fullName;
        this.type = membership.memberType;
        this.username = membership.username;
    }
};
