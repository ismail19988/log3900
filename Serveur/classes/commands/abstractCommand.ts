import { VectorObjectClass } from "../shapes/vectorObject";

export class AbstractCommand {

    constructor(protected object: VectorObjectClass){
    }

    public getObject(): VectorObjectClass {
        return this.object;
    }

    execute(): AbstractCommand {
        return this;
    }
    cancel(): AbstractCommand {
        return this;
    }
}