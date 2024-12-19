export class Organization {
    id: string;
    name?: string;
    displayName?: string;
    url?: string;

    constructor(id: string, name?: string, displayName?: string) {
        this.displayName = displayName ?? name;
        this.id = id;
        this.name = name;
    }
}