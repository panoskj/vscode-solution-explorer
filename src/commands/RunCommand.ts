import { ContextValues, TreeItem } from "@tree";
import { Action, Run } from "@actions";
import { ActionsCommand } from "@commands";

export class RunCommand extends ActionsCommand {
    constructor() {
        super('Run');
    }

    public  shouldRun(item: TreeItem): boolean {
        return item && (item.contextValue === ContextValues.project + '-cps' || item.contextValue === ContextValues.solution + '-cps');
    }

    public async getActions(item: TreeItem): Promise<Action[]> {
        if (!item || !item.path) { return []; }

        return [ new Run(item.path) ];
    }
}
