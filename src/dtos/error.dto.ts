import { Error as TrelloError } from './external/trello.dto';

export class GeneralError {

    description: string;
    name: string;

    constructor(error: TrelloError) {
        this.name = error.error;
        this.description = error.message;
    }

}
