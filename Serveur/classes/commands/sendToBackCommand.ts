import { AbstractCommand } from "./abstractCommand";
import { VectorObjectClass } from "../shapes/vectorObject";
import drawingService from "../../services/drawingService";
import socketService from "../../services/socketService";
import logging from "../../config/logging";

const SOCKET_ROOM_PREFIX = 'DRAWING_';
const NAMESPACE = 'SendToBackCommand';

export class SendToBackCommand extends AbstractCommand {

    constructor(object: VectorObjectClass, private user: string, private name: string, private lastIndex: number, private lastZ: number) {
        super(object);
    }

    execute(): AbstractCommand {
        let index = drawingService.getDrawings().get(this.name)?.getLayerLinkedList().getIndex(this.object);
        // let index = drawingService.getLayerLinkedList().getIndex(this.object);

        let changedObject = drawingService.getDrawings().get(this.name)?.getLayerLinkedList().sendToBack(index as number);
        // let changedObject = drawingService.getLayerLinkedList().sendToBack(index);

        if (changedObject) {

            socketService.getServer().in(SOCKET_ROOM_PREFIX + this.name)
            .emit('edit_z', {
                objects: changedObject
            });
        }

        logging.info(NAMESPACE, "user [" + this.user + "] sent a redo event: object [" + this.object.getId() + "] sent to the back.");

        return this;
    }

    cancel(): AbstractCommand {
        let index = drawingService.getDrawings().get(this.name)?.getLayerLinkedList().getIndex(this.object);
        // let index = drawingService.getLayerLinkedList().getIndex(this.object);

        drawingService.getDrawings().get(this.name)?.getLayerLinkedList().removeIndex(index as number);
        // drawingService.getLayerLinkedList().removeIndex(index);

        // drawingService.getLayerLinkedList().length
        if (drawingService.getDrawings().get(this.name)?.getLayerLinkedList().length == (this.lastIndex)) {
            // drawingService.getLayerLinkedList().insert(this.object);
            drawingService.getDrawings().get(this.name)?.getLayerLinkedList().insert(this.object);
        }
        else {
            // drawingService.getLayerLinkedList().insertIndex(this.object, this.lastIndex);
            drawingService.getDrawings().get(this.name)?.getLayerLinkedList().insertIndex(this.object, this.lastIndex);
        }

        this.object.setZ(this.lastZ);

        socketService.getServer().in(SOCKET_ROOM_PREFIX + this.name)
        .emit('edit_z', {
            objects: [
                {
                    id: this.object.getId(),
                    z: this.object.getZ()
                }
            ]
        });

        logging.info(NAMESPACE, "user [" + this.user + "] sent an undo event: object [" + this.object.getId() + "] restored to its last index [" + this.lastIndex + "].");

        return this;
    }
}