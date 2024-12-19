import fs from 'fs';

import {
    CancellationToken,
    Event, EventEmitter,
    ProviderResult,
    ThemeIcon,
    TreeDataProvider,
    TreeItem,
    TreeItemCollapsibleState
} from "vscode";
import { General } from "../dtos/general.dto";
import { getLastUpdated } from "../utils/date";

export class ProjectBoardProvider implements TreeDataProvider<Dependency> {

    private _cachedBoards: { [key: string]: General } = {};

    private _filenameTemplateSuffixLength = 12;

    constructor(private storagePath: string) {}

    private _onDidChangeTreeData: EventEmitter<Dependency | undefined | null | void> = new EventEmitter<Dependency | undefined | null | void>();
    
    readonly onDidChangeTreeData: Event<Dependency | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Dependency): TreeItem | Thenable<TreeItem> {
        return element;
    }

    getChildren(element?: any): ProviderResult<Dependency[]> {
        if (element) {
            let boards: Dependency[] = [];
            boards = boards.concat(this._cachedBoards[element.id].boards.map(board => new Dependency(
                `${board.name}[${board.cards?.length ?? 0} Tasks]`,
                TreeItemCollapsibleState.None,
                board.id,
                board.lastActivityDate
            )));
            return boards;
        }
        const files: string[] = fs.readdirSync(this.storagePath);
        let platforms: Dependency[] = [];
        
        if (this.storagePath && files) {
            for (const file of files) {
                const general: General = JSON.parse(fs.readFileSync(`${this.storagePath}/${file}`, 'utf-8'));
                const cacheKey: string = file.substring(0, file.length - this._filenameTemplateSuffixLength);
                this._cachedBoards[cacheKey] = general;
                platforms.push(new Dependency(cacheKey.toUpperCase(), TreeItemCollapsibleState.Collapsed, cacheKey, general.lastUpdated));
            }
        }
        return platforms;
    }

    getParent?(element: Dependency): ProviderResult<Dependency> {
        throw new Error("Method not implemented.");
    }

    resolveTreeItem?(item: TreeItem, element: Dependency, token: CancellationToken): ProviderResult<TreeItem> {
        throw new Error("Method not implemented.");
    }

}

class Dependency extends TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        public readonly id: string, 
        public readonly lastUpdated: Date
    ) {
        super(label, collapsibleState);
        this.id = id;
        this.tooltip = this.label + ` - Updated ${getLastUpdated(lastUpdated)} ago`;
        if(collapsibleState === TreeItemCollapsibleState.None) {
            this.iconPath = new ThemeIcon('combine');

        }
    }

}
