/**
 * General tag class
 */
export class Tag {

    id: string;
    name: string;
    color: string;

    constructor(id: string, name: string, color: string) {
        this.color  = color;
        this.id = id;
        this.name = name;
    }

}
