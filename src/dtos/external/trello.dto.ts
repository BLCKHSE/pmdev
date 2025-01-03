type AttachmentLabel = 'perBoard' | 'perCard';

type BoardLabel = 'totalMembersPerBoard' | 'totalAccessRequestsPerBoard';

type CardLabel = 'openPerBoard' | 'openPerList' | 'totalPerBoard' | 'totalPerList';

type Status = 'ok' | 'warning';

type ViewType = 'Board' | 'Table' | 'Calendar' | 'Dashboard' | 'Timeline' | 'Map';

export type Board = {
    id: string,
    nodeId: string,
    name: string,
    desc: string,
    descData: null,
    closed: boolean,
    dateClosed: string,
    idOrganization: string,
    idEnterprise: string,
    limits: {
        attachments: {
            [Property in keyof AttachmentLabel]: LimitItem;
        },
        boards: {
            [Property in keyof BoardLabel]: LimitItem;
        },
        cards: {
            [Property in keyof CardLabel]: LimitItem;
        },
        checklists: {
            [Property in keyof AttachmentLabel]: LimitItem | null;
        },
        checkItems: {
            perChecklist: LimitItem,
        },
        customFields: {
            [Property in keyof AttachmentLabel]: LimitItem | null;
        },
        customFieldOptions: { perField?: LimitItem },
        labels: { perBoard: LimitItem },
        lists: {
            openPerBoard: LimitItem,
            totalPerBoard: LimitItem
        },
        stickers: { perCard: LimitItem},
        reactions: { perAction: LimitItem, uniquePerAction: LimitItem }
    },
    pinned: boolean,
    starred: boolean,
    url: string,
    prefs: {
        permissionLevel: string,
        hideVotes: boolean,
        voting: 'disabled' | 'enabled',
        comments: string,
        invitations: string,
        selfJoin: boolean,
        cardCovers: boolean,
        cardCounts: boolean,
        isTemplate: boolean,
        cardAging: 'pirate' | 'regular',
        calendarFeedEnabled: boolean,
        hiddenPluginBoardButtons?: [],
        switcherViews: {viewType: ViewType, enabled: boolean}[],
        background: string,
        backgroundColor?: string,
        backgroundImage?: string,
        backgroundTile?: boolean,
        backgroundBrightness?: string,
        sharedSourceUrl: string,
        backgroundImageScaled: ScaledBgImageItem[],
        backgroundBottomColor: string,
        backgroundTopColor: string,
        canBePublic: boolean,
        canBeEnterprise: boolean,
        canBeOrg: boolean,
        canBePrivate: boolean,
        canInvite: boolean
    },
    shortLink: string,
    subscribed: boolean,
    labelNames: {[key: string]: string | null},
    powerUps?: [],
    dateLastActivity: Date,
    dateLastView: Date,
    shortUrl: string,
    idTags?: [],
    datePluginDisable?: Date | null,
    creationMethod: true,
    ixUpdate: string,
    templateGallery?: string | null,
    enterpriseOwned: boolean,
    idBoardSource?: string | null,
    premiumFeatures: string[],
    idMemberCreator: string,
    type?: string | null,
    memberships: MembershipItem[],
    organization?: Organization,
};

export type Badge = {
    attachmentsByType: {
        trello: {
            board: number,
            card: number,
        }
    },
    externalSource?: string,
    location: boolean,
    votes: 0,
    viewingMemberVoted: boolean,
    subscribed: boolean,
    lastUpdatedByAi: boolean,
    fogbugz: string,
    checkItems: number,
    checkItemsChecked: number,
    checkItemsEarliestDue?: string,
    comments: number,
    attachments: number,
    description: boolean,
    due?: string,
    dueComplete: boolean,
    start?: string
};

export type Card = {
    id: string,
    badges: Badge,
    checkItemStates: any[],
    closed: boolean,
    dueComplete: boolean,
    dateLastActivity?: string,
    desc: string,
    descData: {
        emoji: any,
    },
    due?: string,
    dueReminder?: string,
    email?: string,
    idBoard: string,
    idChecklists: any[],
    idList: string,
    idMembers: string[],
    idMembersVoted: string[],
    idShort: number,
    idAttachmentCover?: string,
    labels?: LabelItem[],
    idLabels?: string[],
    manualCoverAttachment: boolean,
    name: string,
    pinned: boolean,
    pos: number,
    shortLink: string,
    shortUrl: string,
    start?: string,
    subscribed: boolean,
    url: string,
    cover: {
        idAttachment?: string,
        color?: string,
        idUploadedBackground?: string,
        size: string,
        brightness: string,
        idPlugin?: string
    },
    isTemplate: boolean,
    cardRole?: string,
    mirrorSourceId?: string
};

export type Error = {
    message: string,
    error: string,
} ;

export type LabelItem =  {
    id: string,
    idBoard: string,
    idOrganization: string,
    name: string,
    nodeId: string,
    color: string,
    uses: number,
};

type LimitItem = {
    status: Status,
    disableAt: number,
    warnAt: number
};

export type List = {
    id: string,
    name: string,
    closed: boolean,
    color?: string,
    idBoard: string,
    pos: number,
    subscribed: boolean,
    softLimit?: string,
    type?: string,
    datasource: {
        filter: boolean
    }
};

export type MembershipItem = {
    avatarUrl?: string,
    dateLastActive?: Date,
    email?: string,
    fullName?: string,
    id: string,
    idMember: string,
    memberType: string,
    unconfirmed: boolean,
    username?: string,
    deactivated: boolean,
};

export type Organization = {
    id: string,
    name: string,
    displayName: string,
    desc: string,
    descData: {
        emoji: object,
    },
    url: string,
    website?: null,
    teamType: null,
    logoHash?: string,
    logoUrl?: string,
    offering: string,
    products: [],
    powerUps: []
};

type ScaledBgImageItem = {
    "width": number,
    "height": number,
    "url": string
};

type TokenPermission = {
    idModel: string,
    modelType: 'Member' | 'Board' | 'Organisation',
    read: boolean,
    write: boolean
};

export type Token = {
    id: string,
    identifier: "PMDEV",
    idMember: string,
    dateCreated: Date,
    dateExpires?: Date,
    permissions: TokenPermission[],
    appKey?: string
};
