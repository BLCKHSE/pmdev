import {
    CancellationToken,
    Event,
    EventEmitter,
    ProviderResult,
    TreeDataProvider,
    TreeItem,
    TreeItemCollapsibleState,
    Uri
} from "vscode";

import { General } from "../dtos/general.dto";
import { getLastUpdated } from "../utils/date";
import path from "path";

export class ProjectBoardProvider implements TreeDataProvider<Dependency> {

    private _cachedBoards: { [key: string]: General } = {};

    private boards?: General[] | null;

    private extensionPath?: string;

    constructor(boards: General[], extensionPath: string) {
        this.boards = boards;
        this.extensionPath = extensionPath;
    }

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
                board.name,
                TreeItemCollapsibleState.None,
                this.extensionPath ?? '',
                board.id,
                board.lastActivityDate
            )));
            return boards;
        }
        let platforms: Dependency[] = [];
        
        if (this.boards) {
            for (const board of this.boards) {
                this._cachedBoards[board.key] = board;
                platforms.push(new Dependency(board.key.toUpperCase(), TreeItemCollapsibleState.Collapsed, this.extensionPath ?? '', board.key, board.lastUpdated));
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
        public readonly extensionPath: string,
        public readonly id: string, 
        public readonly lastUpdated: Date
    ) {
        super(label, collapsibleState);
        this.id = id;
        this.tooltip = this.label + ` - Updated ${getLastUpdated(lastUpdated)} ago`;
        if(collapsibleState === TreeItemCollapsibleState.None) {
            this.iconPath = {
                light: Uri.file(path.join(extensionPath, 'resources/icons', 'board-icon-light.svg')),
                dark: Uri.file(path.join(extensionPath, 'resources/icons', 'board-icon-dark.svg')),
            };
            this.command = {
                command: 'pmdev.open',
                title: 'Load Project Board',
                arguments: [id, label]
            };
        }
    }

}
