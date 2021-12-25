import { AbstractCommand } from "./abstractCommand";
import socketService from "../../services/socketService";
import { LineClass } from "../shapes/line";
import { Line } from "../../interfaces/drawing/line";
import { VectorObjectClass } from "../shapes/vectorObject";
import { ShapeClass } from "../shapes/shape";
import { RectangleClass } from "../shapes/rectangle";
import { Shape } from "../../interfaces/drawing/shape";
import drawingService from "../../services/drawingService";
import commandControllerService from "../../services/commandControllerService";

const SOCKET_ROOM_PREFIX = 'DRAWING_';

export class DeleteCommand extends AbstractCommand {

    constructor(object: VectorObjectClass, private user: string, private name: string) {
        super(object);
    }

    execute(): AbstractCommand {
        socketService.getServer().in(SOCKET_ROOM_PREFIX + this.name)
        .emit('unselect', {
            name: this.name,
            user: this.user,
            id: this.object.getId()
        })

        this.object.setIsSelected(false);

        socketService.getServer().in(SOCKET_ROOM_PREFIX + this.name)
        .emit('delete', {
            name: this.name,
            user: this.user,
            id: this.object.getId()
        });

        let index = drawingService.getDrawings().get(this.name)?.getLayerLinkedList().getIndex(this.object);
        // let index = drawingService.getLayerLinkedList().getIndex(this.object);

        drawingService.getDrawings().get(this.name)?.getLayerLinkedList().removeIndex(index as number);
        // drawingService.getLayerLinkedList().removeIndex(index);

        drawingService.getDrawings().get(this.name)?.removeObject(this.object.getId());

        return this;
    }

    cancel(): AbstractCommand {
        if (this.object instanceof LineClass) {
            socketService.getServer().in(SOCKET_ROOM_PREFIX + this.name)
            .emit('create_line', {
                line: {
                    id: this.object.getId(),
                    z: this.object.getZ(),
                    isSelected: false,
                    color: this.object.getColor(),  
                    points: this.object.getPoints(),
                    strokeWidth: this.object.getStrokeWidth(),
                    matrix: this.object.getMatrix()
                } as Line,
                user: this.user
            });
        } else if (this.object instanceof ShapeClass) {

            let createEvent: string = (this.object instanceof RectangleClass) ? 'create_rectangle' : 'create_ellipse';

            socketService.getServer().in(SOCKET_ROOM_PREFIX + this.name)
            .emit(createEvent, {
                shape: {
                    id: this.object.getId(),
                    z: this.object.getZ(),
                    isSelected: false,
                    color: this.object.getColor(),
                    strokeWidth: this.object.getStrokeWidth(),
                    strokeColor: this.object.getStrokeColor(),
                    initialPoint: this.object.getInitialPoint(),
                    finalPoint: this.object.getFinalPoint(),
                    matrix: this.object.getMatrix()
                } as Shape,
                user: this.user
            });
        } else {
            return this;
        }

        drawingService.getDrawings().get(this.name)?.addObject(this.object.getId(), this.object);

        drawingService.getDrawings().get(this.name)?.getLayerLinkedList().insert(this.object);
        // drawingService.getLayerLinkedList().insert(this.object);

        commandControllerService.setLastUpdate(this.object.getId(), this.user);

        return this;
    }
}