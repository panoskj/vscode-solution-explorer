import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { Action, Paste } from "@actions";
import { ActionsCommand } from "@commands";

export class PasteCommand extends ActionsCommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Paste');
    }

    public  shouldRun(item: TreeItem): boolean {
        if (item && item.path) { return true; }
        return !!item && !!item.path && !!item.project;
    }

    public getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path || !item.project) { return Promise.resolve([]); }

        return Promise.resolve([new Paste(item.project, item.path)]);
    }
}
