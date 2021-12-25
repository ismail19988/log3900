import { AbstractCommand } from "./abstractCommand";
import socketService from "../../services/socketService";
import { LineClass } from "../shapes/line";
import { Line } from "../../interfaces/drawing/line";
import { VectorObjectClass } from "../shapes/vectorObject";
import { ShapeClass } from "../shapes/shape";
import { RectangleClass } from "../shapes/rectangle";
import { Shape } from "../../interfaces/drawing/shape";
import { EllipseClass } from "../shapes/ellipse";
import drawingService from "../../services/drawingService";
import { VectorObject } from "../../interfaces/drawing/vectorObject";

const SOCKET_ROOM_PREFIX = 'DRAWING_';

export class EditCommand extends AbstractCommand {

    constructor(object: VectorObjectClass, private oldObject: VectorObject, private updatedObject: VectorObject, private user: string, private name: string) {
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
        
        if (this.object instanceof LineClass) {
            socketService.getServer().in(SOCKET_ROOM_PREFIX + this.name)
            .emit('edit_line', {
                name: this.name,
                user: this.user,
                id: this.object.getId(),
                line: {
                    id: this.updatedObject.id,
                    isSelected: false,
                    z: this.updatedObject.z,
                    color: this.updatedObject.color,
                    strokeWidth: this.updatedObject.strokeWidth,
                    points: [],
                    matrix: this.updatedObject.matrix
                } as Line
            });

        } else if (this.object instanceof ShapeClass) {
            let event = this.object instanceof RectangleClass ? 'edit_rectangle' : 'edit_ellipse';
            socketService.getServer().in(SOCKET_ROOM_PREFIX + this.name)
            .emit(event, {
                name: this.name,
                user: this.user,
                id: this.object.getId(),
                shape: {
                    id: this.updatedObject.id,
                    isSelected: false,
                    z: this.updatedObject.z,
                    color: this.updatedObject.color,
                    strokeWidth: this.updatedObject.strokeWidth,
                    strokeColor: (this.updatedObject as Shape).strokeColor,
                    initialPoint: { x: 0, y: 0 },
                    finalPoint: { x: 0, y: 0 },
                    text: (this.updatedObject as Shape).text,
                    textColor: (this.updatedObject as Shape).textColor,
                    matrix: this.updatedObject.matrix
                } as Shape
            });
            (this.object as ShapeClass).setStrokeColor((this.updatedObject as Shape).strokeColor);
            (this.object as ShapeClass).setText((this.updatedObject as Shape).text);
            (this.object as ShapeClass).setTextcolor((this.updatedObject as Shape).textColor);
        } else {
            return this;
        }

        this.object.changeColor(this.updatedObject.color);
        this.object.setZ(this.updatedObject.z);
        this.object.setStrokeWidth(this.updatedObject.strokeWidth);
        this.object.setMatrix(this.updatedObject.matrix);

        return this;
    }

    cancel(): AbstractCommand {

        socketService.getServer().in(SOCKET_ROOM_PREFIX + this.name)
        .emit('unselect', {
            name: this.name,
            user: this.user,
            id: this.object.getId()
        })

        this.object.setIsSelected(false);

        if (this.object instanceof LineClass) {
            socketService.getServer().in(SOCKET_ROOM_PREFIX + this.name)
            .emit('edit_line', {
                name: this.name,
                user: this.user,
                id: this.object.getId(),
                line: {
                    id: this.object.getId(),
                    isSelected: false,
                    z: this.oldObject.z,
                    color: this.oldObject.color,
                    strokeWidth: this.oldObject.strokeWidth,
                    points: [],
                    matrix: this.oldObject.matrix
                } as Line
            });
        } else if (this.object instanceof ShapeClass) {
            let event = this.object instanceof RectangleClass ? 'edit_rectangle' : 'edit_ellipse';
            socketService.getServer().in(SOCKET_ROOM_PREFIX + this.name)
            .emit(event, {
                name: this.name,
                user: this.user,
                id: this.object.getId(),
                shape: {
                    id: this.object.getId(),
                    isSelected: false,
                    z: this.oldObject.z,
                    color: this.oldObject.color,
                    strokeWidth: this.oldObject.strokeWidth,
                    strokeColor: (this.oldObject as Shape).strokeColor,
                    initialPoint: { x: 0, y: 0 },
                    finalPoint: { x: 0, y: 0 },
                    text: (this.oldObject as Shape).text,
                    textColor: (this.oldObject as Shape).textColor,
                    matrix: this.oldObject.matrix
                } as Shape
            });
            (this.object as ShapeClass).setStrokeColor((this.oldObject as Shape).strokeColor);
            (this.object as ShapeClass).setText((this.oldObject as Shape).text);
            (this.object as ShapeClass).setTextcolor((this.oldObject as Shape).textColor);
        } else {
            return this;
        }

        this.object.changeColor(this.oldObject.color);
        this.object.setZ(this.oldObject.z);
        this.object.setStrokeWidth(this.oldObject.strokeWidth);
        this.object.setMatrix(this.oldObject.matrix);

        return this;
    }
}