import { Uri } from "vscode";

export type WebviewDTO = {
    cspSource: string;
    nonce?: string;
    scriptUri: Uri; 
    styleUri: Uri;
    title: string;
};
