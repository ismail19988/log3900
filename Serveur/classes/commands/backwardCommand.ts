import { AbstractCommand } from "./abstractCommand";
import { VectorObjectClass } from "../shapes/vectorObject";
import drawingService from "../../services/drawingService";
import socketService from "../../services/socketService";
import logging from "../../config/logging";

const SOCKET_ROOM_PREFIX = 'DRAWING_';
const NAMESPACE = 'BackwardCommand';

export class BackwardCommand extends AbstractCommand {

    constructor(object: VectorObjectClass, private user: string, private name: string) {
        super(object);
    }

    execute(): AbstractCommand {
        let index = drawingService.getDrawings().get(this.name)?.getLayerLinkedList().getIndex(this.object);
        // let index = drawingService.getLayerLinkedList().getIndex(this.object);
        
        let changedObject = drawingService.getDrawings().get(this.name)?.getLayerLinkedList().bumpDown(index as number);
        // let changedObject = drawingService.getLayerLinkedList().bumpDown(index);

        if (changedObject) {
            socketService.getServer().in(SOCKET_ROOM_PREFIX + this.name)
            .emit('edit_z', {
                objects: changedObject
            });
        }

        logging.info(NAMESPACE, "user [" + this.user + "] sent an undo event: object [" + this.object.getId() + "] sent backward.");

        return this;
    }

    cancel(): AbstractCommand {
        let index = drawingService.getDrawings().get(this.name)?.getLayerLinkedList().getIndex(this.object);
        // let index = drawingService.getLayerLinkedList().getIndex(this.object);

        let changedObject = drawingService.getDrawings().get(this.name)?.getLayerLinkedList().bumpUp(index as number);
        // let changedObject = drawingService.getLayerLinkedList().bumpUp(index);

        if (changedObject) {
            socketService.getServer().in(SOCKET_ROOM_PREFIX + this.name)
            .emit('edit_z', {
                objects: changedObject
            });
        }

        logging.info(NAMESPACE, "user [" + this.user + "] sent a redo event: object [" + this.object.getId() + "] brought forward.");

        return this;
    }
}