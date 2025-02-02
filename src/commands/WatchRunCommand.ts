import { ContextValues, TreeItem } from "@tree";
import { Action, Watch } from "@actions";
import { ActionsCommand } from "@commands";

export class WatchRunCommand extends ActionsCommand {
    constructor() {
        super('Watch');
    }

    public  shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new Watch(item.path) ];
    }
}
