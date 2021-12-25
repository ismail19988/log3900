import { Server, Socket } from "socket.io";
import { Drawing } from "../classes/drawing";
import { LineClass } from "../classes/shapes/line";
import { ShapeClass } from "../classes/shapes/shape";
import logging from "../config/logging";
import { IDrawing } from "../interfaces/drawing/drawing";
import { Line } from "../interfaces/drawing/line";
import { Shape } from "../interfaces/drawing/shape";
import { uuidv4 } from "../utils/uuidV4";
import DatabaseService from "./databaseService";
import commandControllerService from "./commandControllerService";
import { CreateCommand } from "../classes/commands/createCommand";
import { EllipseClass } from "../classes/shapes/ellipse";
import { RectangleClass } from "../classes/shapes/rectangle";
import { DeleteCommand } from "../classes/commands/deleteCommand";
import { VectorObjectClass } from "../classes/shapes/vectorObject";
import { EditCommand } from "../classes/commands/editCommand";
import { VectorObject } from "../interfaces/drawing/vectorObject";
import userService from "./UserService";
import { DoublyLinkedList } from "../classes/linkedList";
import { IMatrix } from "../interfaces/drawing/matrix";
import { SendToBackCommand } from "../classes/commands/sendToBackCommand";
import { BringToFrontCommand } from "../classes/commands/bringToFrontCommand";
import { ForwardCommand } from "../classes/commands/forwardCommand";
import { BackwardCommand } from "../classes/commands/backwardCommand";

const SOCKET_ROOM_PREFIX = 'DRAWING_';

class DrawingService {

    private drawings = new Map<string, Drawing>();
    private lastObjectState = new Map<string, VectorObject>();
    // email, object
    private selectedObject = new Map<string, Array<any>>();
    // private layerLinkedList = new DoublyLinkedList();
    private NAMESPACE = "Drawing service";
    private io: Server;

    public async init(server : Server) {
        this.io = server;
        this.setUPConnection();

        await DatabaseService.getAllDrawings()
        .then((existing_drawings: Array<IDrawing>) => {
            existing_drawings.forEach((drawing: IDrawing) => {
                this.drawings.set(drawing.name, new Drawing(drawing));
            });
        });
    }
    /**
     * [users] => {drawings}
     * 
     */

    setUPConnection() {
        this.io.on("connection", async (socket: Socket) => {

            let user: any = socket.handshake.query.user;

            // main libre
            this.createLine(socket);
            this.drawLine(socket);

            // rectangle
            this.createRectangle(socket);
            this.drawShape(socket, 'draw_rectangle');

            // Ellipse
            this.createEllipse(socket);
            this.drawShape(socket, 'draw_ellipse');

            // Selection
            this.selectObject(socket);
            this.unselectObject(socket);

            // Supression
            this.deleteObject(socket);

            // end object creation
            this.endDrawing(socket);

            this.editObject(socket);
            this.startEditObject(socket);
            this.endEditObject(socket);

            this.undo(socket);
            this.redo(socket);

            // Couche
            this.sendtoBack(socket);
            this.bringToFront(socket);
            this.forward(socket);
            this.backward(socket);

            this.disconnect(socket);

            commandControllerService.addUser(user);
        });
    }

    private disconnect(socket: Socket) {
        socket.on('disconnect', () => {
            // let user = userService.getUserFromSocketID(socket.id);
            // if(user) {
            //     logging.info(this.NAMESPACE, "User [" + user + "] left the drawing due to a disconnected socket.");
            //     this.drawings.forEach(drawing => {
            //         if(drawing.hasUser(user as string)) {
            //             logging.info(this.NAMESPACE, "User [" + user + "] disconnected from the room [" + drawing.getName() +  "] due to a disconnected socket.");
            //             socket.leave(SOCKET_ROOM_PREFIX + drawing.getName());
            //             drawing.disconnectUser(user as string);
            //         }
            //     });
            //     userService.disconnectUser(user as string);
            //     this.io.emit('disconnected', { user: user });
            // }
        })
    }

    private createLine(socket: Socket): void {

        socket.on('create_line', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);
                const id = uuidv4();

                const line = new LineClass({
                    id: id,
                    isSelected: true,
                    z: this.drawings.get(parsed_param.name)?.getNextZ() as number,
                    color: parsed_param.color,
                    points: [parsed_param.startingPoint],
                    strokeWidth: parsed_param.strokeWidth,
                    matrix: {
                        a: 1,
                        b: 0,
                        c: 0,
                        d: 1,
                        e: 0,
                        f: 0
                    } as IMatrix
                } as Line);

                this.drawings.get(parsed_param.name)?.addObject(
                    id,
                    line
                );
                this.drawings.get(parsed_param.name)?.change();

                this.drawings.get(parsed_param.name)?.getLayerLinkedList().insert(line);
                // this.layerLinkedList.insert(line);

                this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                .emit('create_line', {
                    line : {
                        id: line.getId(),
                        z: line.getZ(),
                        isSelected: line.getIsSelected(),
                        color: line.getColor(),
                        points: line.getPoints(),
                        strokeWidth: line.getStrokeWidth(),
                        matrix: {
                            a: 1,
                            b: 0,
                            c: 0,
                            d: 1,
                            e: 0,
                            f: 0
                        } as IMatrix
                    } as Line,
                    user: parsed_param.user
                });
                
                commandControllerService.setLastUpdate(line.getId(), parsed_param.user);

                logging.info(this.NAMESPACE, "created line [" + id + "] sent by [" + parsed_param.user + "]");
            }
            catch (error) {
                console.log(error);
            }
        });
    }

    private endDrawing(socket: Socket): void {
        socket.on('end_drawing', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);

                this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                .emit('select', {
                    name: parsed_param.name,
                    user: parsed_param.user,
                    id: parsed_param.id
                });

                let command = new CreateCommand(
                    this.drawings.get(parsed_param.name)?.getObjects().get(parsed_param.id) as VectorObjectClass,
                    parsed_param.user,
                    parsed_param.name);

                commandControllerService.addCommand(parsed_param.user, command);

                this.selectedObject.set(
                    parsed_param.user,
                    [this.drawings.get(parsed_param.name)?.getObjects().get(parsed_param.id) as VectorObjectClass, parsed_param.name]);

                logging.info(this.NAMESPACE, "user [" + parsed_param.user + "] ended the drawing of the object [" + parsed_param.id + "]");
            }
            catch (error) {
                console.log(error);
            }
        })
    }

    private drawLine(socket: Socket): void {
        socket.on('draw_line', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);

                (this.drawings
                    .get(parsed_param.name)
                    ?.getObjects()
                    .get(parsed_param.id) as LineClass)
                    .addPoints(parsed_param.point);

                this.drawings.get(parsed_param.name)?.change();

                this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                .emit('draw_line', {
                    name: parsed_param.name,
                    user: parsed_param.user,
                    id: parsed_param.id,
                    point: parsed_param.point
                });
            }
            catch (error) {
                console.log(error);
            }
        })
    }

    private createEllipse(socket: Socket): void {
        socket.on('create_ellipse', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);
                const id = uuidv4();

                const shape = new EllipseClass({
                    id: id,
                    isSelected: true,
                    z: this.drawings.get(parsed_param.name)?.getNextZ() as number,
                    color: parsed_param.color,
                    strokeWidth: parsed_param.strokeWidth,
                    strokeColor: parsed_param.strokeColor,
                    initialPoint: parsed_param.initialPoint,
                    finalPoint: parsed_param.initialPoint,
                    text: parsed_param.text,
                    textColor: parsed_param.textColor,
                    matrix: {
                        a: 1,
                        b: 0,
                        c: 0,
                        d: 1,
                        e: 0,
                        f: 0
                    } as IMatrix
                } as Shape);

                this.drawings.get(parsed_param.name)?.addObject(
                    id,
                    shape
                );

                this.drawings.get(parsed_param.name)?.change();

                this.drawings.get(parsed_param.name)?.getLayerLinkedList().insert(shape);
                // this.layerLinkedList.insert(shape);

                this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                .emit('create_ellipse', {
                    shape : {
                        id: shape.getId(),
                        z: shape.getZ(),
                        isSelected: shape.getIsSelected(),
                        color: shape.getColor(),
                        strokeWidth: shape.getStrokeWidth(),
                        strokeColor: shape.getStrokeColor(),
                        initialPoint: shape.getInitialPoint(),
                        finalPoint: shape.getFinalPoint(),
                        matrix: {
                            a: 1,
                            b: 0,
                            c: 0,
                            d: 1,
                            e: 0,
                            f: 0
                        } as IMatrix
                    } as Shape,
                    user: parsed_param.user});

                commandControllerService.setLastUpdate(shape.getId(), parsed_param.user);

                logging.info(this.NAMESPACE, "created ellipse [" + id + "] sent by [" + parsed_param.user + "]");
            }
            catch (error) {
                console.log(error);
            }
        });
    }

    private createRectangle(socket: Socket): void {
        socket.on('create_rectangle', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);
                const id = uuidv4();

                const shape = new RectangleClass({
                    id: id,
                    isSelected: true,
                    z: this.drawings.get(parsed_param.name)?.getNextZ() as number,
                    color: parsed_param.color,
                    strokeWidth: parsed_param.strokeWidth,
                    strokeColor: parsed_param.strokeColor,
                    initialPoint: parsed_param.initialPoint,
                    finalPoint: parsed_param.initialPoint,
                    text: parsed_param.text,
                    textColor: parsed_param.textColor,
                    matrix: {
                        a: 1,
                        b: 0,
                        c: 0,
                        d: 1,
                        e: 0,
                        f: 0
                    } as IMatrix
                } as Shape);

                this.drawings.get(parsed_param.name)?.addObject(
                    id,
                    shape
                );

                this.drawings.get(parsed_param.name)?.change();

                this.drawings.get(parsed_param.name)?.getLayerLinkedList().insert(shape);
                // this.layerLinkedList.insert(shape);

                this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                .emit('create_rectangle', {
                    shape : {
                        id: shape.getId(),
                        z: shape.getZ(),
                        isSelected: shape.getIsSelected(),
                        color: shape.getColor(),
                        strokeWidth: shape.getStrokeWidth(),
                        strokeColor: shape.getStrokeColor(),
                        initialPoint: shape.getInitialPoint(),
                        finalPoint: shape.getFinalPoint(),
                        matrix: {
                            a: 1,
                            b: 0,
                            c: 0,
                            d: 1,
                            e: 0,
                            f: 0
                        } as IMatrix
                    } as Shape,
                    user: parsed_param.user});

                commandControllerService.setLastUpdate(shape.getId(), parsed_param.user);

                logging.info(this.NAMESPACE, "created rectangle [" + id + "] sent by [" + parsed_param.user + "]");
            }
            catch (error) {
                console.log(error);
            }
        });
    }

    private drawShape(socket: Socket, event: string): void {
        socket.on(event, (params: any) => {
            try {
                const parsed_param = JSON.parse(params);

                (this.drawings
                    .get(parsed_param.name)
                    ?.getObjects()
                    .get(parsed_param.id) as ShapeClass)
                    .setFinalPoint(parsed_param.finalPoint);

                this.drawings.get(parsed_param.name)?.change();
                
                this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                .emit(event, {
                    name: parsed_param.name,
                    user: parsed_param.user,
                    id: parsed_param.id,
                    point: parsed_param.finalPoint
                });
            }
            catch (error) {
                console.log(error);
            }
        })
    }

    private selectObject(socket: Socket) {
        socket.on('select', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);

                let object = this.drawings.get(parsed_param.name)?.getObjects().get(parsed_param.id);

                if (object && !object.getIsSelected()) {
                    this.selectedObject.set(parsed_param.user, [object as VectorObjectClass, parsed_param.name]);
                    object.setIsSelected(true);

                    this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                    .emit('select', {
                        name: parsed_param.name,
                        user: parsed_param.user,
                        id: parsed_param.id
                    });

                    commandControllerService.setLastUpdate(parsed_param.id, parsed_param.user);

                    logging.info(this.NAMESPACE, "user [" + parsed_param.user + "] selected the object [" + parsed_param.id  + "]");
                } else {
                    logging.info(this.NAMESPACE, "user [" + parsed_param.user + "] failed to select the object [" + parsed_param.id + "] (already selected)");
                }
            }
            catch (error) {
                console.log(error);
            }
        })
    }

    private unselectObject(socket: Socket) {
        socket.on('unselect', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);

                let object = this.drawings.get(parsed_param.name)?.getObjects().get(parsed_param.id);

                if (object && object.getIsSelected()) {
                    this.selectedObject.delete(parsed_param.user);
                    object.setIsSelected(false);

                    this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                    .emit('unselect', {
                        name: parsed_param.name,
                        user: parsed_param.user,
                        id: parsed_param.id
                    });

                    logging.info(this.NAMESPACE, "user [" + parsed_param.user + "] unselected the object [" + parsed_param.id + "]");
                } else {
                    logging.error(this.NAMESPACE, "user [" + parsed_param.user + "] failed to unselect the object [" + parsed_param.id + "] (not selected)");
                }
            }
            catch (error) {
                console.log(error);
            }
        })
    }

    private deleteObject(socket: Socket) {
        socket.on('delete', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);

                if (this.drawings.get(parsed_param.name)?.getObjects().get(parsed_param.id)?.getIsSelected()) {

                    this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                    .emit('unselect', {
                        name: parsed_param.name,
                        user: parsed_param.user,
                        id: parsed_param.id
                    });

                    this.drawings.get(parsed_param.name)?.getObjects().get(parsed_param.id)?.setIsSelected(false);

                    this.drawings.get(parsed_param.name)?.change();

                    commandControllerService.setLastUpdate(parsed_param.id, parsed_param.user);

                    let command = new DeleteCommand(
                        this.drawings.get(parsed_param.name)?.getObjects().get(parsed_param.id) as VectorObjectClass,
                        parsed_param.user,
                        parsed_param.name);

                    commandControllerService.addCommand(parsed_param.user, command);

                    this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                    .emit('delete', {
                        name: parsed_param.name,
                        user: parsed_param.user,
                        id: parsed_param.id
                    });

                    let object = this.drawings.get(parsed_param.name)?.getObjects().get(parsed_param.id);

                    let index = this.drawings.get(parsed_param.name)?.getLayerLinkedList().getIndex(object as VectorObjectClass);
                    // let index = this.layerLinkedList.getIndex(object as VectorObjectClass);

                    this.drawings.get(parsed_param.name)?.getLayerLinkedList().removeIndex(index as number);
                    // this.layerLinkedList.removeIndex(index);

                    this.drawings.get(parsed_param.name)?.getObjects().delete(parsed_param.id);

                    logging.info(this.NAMESPACE, "user [" + parsed_param.user + "] deleted the object [" + parsed_param.id + "]");
                }
                else {
                    logging.info(this.NAMESPACE, "user [" + parsed_param.user + "] failed to delete the object [" + parsed_param.id + "] (not selected)");
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }

    private editObject(socket: Socket) {
        socket.on('edit', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);

                let object = this.drawings.get(parsed_param.name)?.getObjects().get(parsed_param.id);
                this.drawings.get(parsed_param.name)?.change();

                let oldObject: VectorObject;
                let updatedObject: VectorObject;

                if (object instanceof LineClass) {

                    oldObject = {
                        id: object.getId(),
                        isSelected: object.getIsSelected(),
                        z: object.getZ(),
                        color: object.getColor(),
                        strokeWidth: object.getStrokeWidth(),
                        points: object.getPoints(),
                        matrix: object.getMatrix()
                    } as Line;

                    updatedObject = {
                        id: object?.getId() as string,
                        isSelected: object?.getIsSelected() as boolean,
                        // TODO UPDATE
                        z: object?.getZ() as number,
                        color: parsed_param.line.color,
                        strokeWidth: parsed_param.line.strokeWidth,
                        points: [],
                        matrix: object.getMatrix()
                    } as Line;

                    this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                    .emit('edit_line', {
                        name: parsed_param.name,
                        user: parsed_param.user,
                        id: parsed_param.id,
                        line: updatedObject
                    });

                    commandControllerService.setLastUpdate(parsed_param.id, parsed_param.user);

                    let command = new EditCommand(
                        object,
                        oldObject,
                        updatedObject,
                        parsed_param.user,
                        parsed_param.name
                    );
    
                    commandControllerService.addCommand(parsed_param.user, command);
                    
                    object.changeColor(updatedObject.color);
                    object.setZ(updatedObject.z);
                    object.setMatrix(updatedObject.matrix);
                }
                
                else if (object instanceof ShapeClass) {
                    let event = object instanceof RectangleClass ? 'edit_rectangle' : 'edit_ellipse'

                    oldObject = {
                        id: object.getId(),
                        isSelected: object.getIsSelected(),
                        z: object.getZ(),
                        color: object.getColor(),
                        strokeWidth: object.getStrokeWidth(),
                        strokeColor: object.getStrokeColor(),
                        initialPoint: object.getInitialPoint(),
                        finalPoint: object.getFinalPoint(),
                        text: object.getText(),
                        textColor: object.getTextColor(),
                        matrix: object.getMatrix()
                    } as Shape;

                    updatedObject = {
                        id: object?.getId() as string,
                        isSelected: object?.getIsSelected() as boolean,
                        // TODO changer
                        z: object?.getZ() as number,
                        color: parsed_param.shape.color,
                        strokeWidth: object.getStrokeWidth(),
                        strokeColor: parsed_param.shape.strokeColor,
                        initialPoint: { x: 0, y: 0 },
                        finalPoint: { x: 0, y: 0 },
                        text: object.getText(),
                        textColor: parsed_param.shape.textColor,
                        matrix:  object.getMatrix()
                    } as Shape;

                    this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                    .emit(event, {
                        name: parsed_param.name,
                        user: parsed_param.user,
                        id: parsed_param.id,
                        shape: updatedObject
                    });

                    commandControllerService.setLastUpdate(parsed_param.id, parsed_param.user);

                    let command = new EditCommand(
                        object,
                        oldObject,
                        updatedObject,
                        parsed_param.user,
                        parsed_param.name
                    );
    
                    commandControllerService.addCommand(parsed_param.user, command);

                    object.setZ(updatedObject.z);
                    object.changeColor(updatedObject.color);
                    object.setStrokeColor((updatedObject as Shape).strokeColor);
                    object.setTextcolor((updatedObject as Shape).textColor);
                    object.setMatrix(updatedObject.matrix)
                    
                } else {
                    throw Error("Unhandled object class");
                }

                logging.info(this.NAMESPACE, "User [" + parsed_param.user + "] modified the object [" + parsed_param.id + "]");

            }
            catch (error) {
                console.log(error);
            }
        });
    }

    private startEditObject(socket: Socket) {
        socket.on('start_edit', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);                
                var object = this.drawings.get(parsed_param.name)?.getObjects().get(parsed_param.id);

                var oldObject: VectorObject;
                var updatedObject: VectorObject;

                if (object instanceof LineClass) {

                    oldObject = {
                        id: object.getId(),
                        isSelected: object.getIsSelected(),
                        z: object.getZ(),
                        color: object.getColor(),
                        strokeWidth: object.getStrokeWidth(),
                        points: object.getPoints(),
                        matrix: object.getMatrix()
                    } as Line;

                    updatedObject = {
                        id: object?.getId() as string,
                        isSelected: object?.getIsSelected() as boolean,
                        // TODO UPDATE
                        z: parsed_param.line.z,
                        color: object?.getColor(),
                        strokeWidth: parsed_param.line.strokeWidth,
                        points: object.getPoints(),
                        matrix: {
                            a: parsed_param.line.matrix.a,
                            b: parsed_param.line.matrix.b,
                            c: parsed_param.line.matrix.c,
                            d: parsed_param.line.matrix.d,
                            e: parsed_param.line.matrix.e,
                            f: parsed_param.line.matrix.f
                        } as IMatrix
                    } as Line;

                    this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                    .emit('edit_line', {
                        name: parsed_param.name,
                        user: parsed_param.user,
                        id: parsed_param.id,
                        line: updatedObject
                    });

                    commandControllerService.setLastUpdate(parsed_param.id, parsed_param.user);
    
                    if (!this.lastObjectState.has(parsed_param.id)) {
                        this.lastObjectState.set(parsed_param.id, oldObject);
                        logging.info(this.NAMESPACE, "User [" + parsed_param.user + "] started modifying the object [" + parsed_param.id + "]");
                    }
                    
                    object.setZ(parsed_param.line.z);
                    object.setStrokeWidth(parsed_param.line.strokeWidth);
                    object.setMatrix(parsed_param.line.matrix);
                }
                
                else if (object instanceof ShapeClass) {

                    let event = object instanceof RectangleClass ? 'edit_rectangle' : 'edit_ellipse'

                    //console.log(parsed_param.shape.text)
                    oldObject = {
                        id: object.getId(),
                        isSelected: object.getIsSelected(),
                        z: object.getZ(),
                        color: object.getColor(),
                        strokeWidth: object.getStrokeWidth(),
                        strokeColor: object.getStrokeColor(),
                        initialPoint: object.getInitialPoint(),
                        finalPoint: object.getFinalPoint(),
                        text: object.getText(),
                        textColor: object.getTextColor(),
                        matrix: object.getMatrix()
                    } as Shape;

                    updatedObject = {
                        id: object?.getId() as string,
                        isSelected: object?.getIsSelected() as boolean,
                        // TODO changer
                        z: parsed_param.shape.z,
                        color: object?.getColor(),
                        strokeWidth: parsed_param.shape.strokeWidth,
                        strokeColor: object?.getStrokeColor(),
                        initialPoint: { x: 0, y: 0 },
                        finalPoint: { x: 0, y: 0 },
                        text: parsed_param.shape.text,
                        textColor: object.getTextColor(),
                        matrix: {
                            a: parsed_param.shape.matrix.a,
                            b: parsed_param.shape.matrix.b,
                            c: parsed_param.shape.matrix.c,
                            d: parsed_param.shape.matrix.d,
                            e: parsed_param.shape.matrix.e,
                            f: parsed_param.shape.matrix.f
                        } as IMatrix
                    } as Shape;

                    //console.log(updatedObject);

                    this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                    .emit(event, {
                        name: parsed_param.name,
                        user: parsed_param.user,
                        id: parsed_param.id,
                        shape: updatedObject
                    });

                    commandControllerService.setLastUpdate(parsed_param.id, parsed_param.user);

                    if (!this.lastObjectState.has(parsed_param.id)) {
                        this.lastObjectState.set(parsed_param.id, oldObject);
                        logging.info(this.NAMESPACE, "User [" + parsed_param.user + "] started modifying the object [" + parsed_param.id + "]");
                    }

                    object.setZ(parsed_param.shape.z);
                    object.setStrokeWidth(parsed_param.shape.strokeWidth);
                    object.setText(parsed_param.shape.text);
                    object.setMatrix(parsed_param.shape.matrix);
                } else {
                    throw Error("Unhandled object class");
                }

            }
            catch (error) {
                console.log(error);
            }
        })
    }

    private endEditObject(socket: Socket) {
        socket.on('end_edit', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);

                let object = this.drawings.get(parsed_param.name)?.getObjects().get(parsed_param.id);
                this.drawings.get(parsed_param.name)?.change();

                let updatedObject;

                if (object instanceof LineClass) {
                    updatedObject = {
                        id: object?.getId() as string,
                        isSelected: object?.getIsSelected() as boolean,
                        z: object.getZ(),
                        color: object?.getColor(),
                        strokeWidth: object.getStrokeWidth(),
                        points: object.getPoints(),
                        matrix: object.getMatrix()
                    } as Line;
                } else if (object instanceof ShapeClass) {
                    updatedObject = {
                        id: object?.getId() as string,
                        isSelected: object?.getIsSelected() as boolean,
                        z: object.getZ(),
                        color: object?.getColor(),
                        strokeWidth: object.getStrokeWidth(),
                        strokeColor: object?.getStrokeColor(),
                        initialPoint: object.getInitialPoint(),
                        finalPoint: object.getFinalPoint(),
                        text: object.getText(),
                        textColor: object.getTextColor(),
                        matrix: object.getMatrix()
                    } as Shape;
                }

                let command = new EditCommand(
                    this.drawings.get(parsed_param.name)?.getObjects().get(parsed_param.id) as VectorObjectClass,
                    this.lastObjectState.get(parsed_param.id) as VectorObject,
                    updatedObject as VectorObject,
                    parsed_param.user,
                    parsed_param.name);

                commandControllerService.addCommand(parsed_param.user, command);

                this.lastObjectState.delete(parsed_param.id);

                logging.info(this.NAMESPACE, "user [" + parsed_param.user + "] stopped modifying the object [" + parsed_param.id + "]");
            }
            catch (error) {
                console.log(error);
            }
        })
    }

    private undo(socket: Socket) {
        socket.on('undo', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);

                commandControllerService.undo(parsed_param.user);

                logging.info(this.NAMESPACE, "user [" + parsed_param.user + "] sent a undo event.");
                this.drawings.get(parsed_param.name)?.change();
            }
            catch (error) {
                console.log(error);
            }
        })
    }

    private redo(socket: Socket) {
        socket.on('redo', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);

                commandControllerService.redo(parsed_param.user);
                
                logging.info(this.NAMESPACE, "user [" + parsed_param.user + "] sent a redo event.");
                this.drawings.get(parsed_param.name)?.change();

            }
            catch (error) {
                console.log(error);
            }
        })
    }

    private sendtoBack(socket: Socket) {
        socket.on('send_to_back', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);

                let object = this.drawings.get(parsed_param.name)?.getObjects().get(parsed_param.id);
                this.drawings.get(parsed_param.name)?.change();

                let index = this.drawings.get(parsed_param.name)?.getLayerLinkedList().getIndex(object as VectorObjectClass);
                // let index = this.layerLinkedList.getIndex(object as VectorObjectClass);

                let lastZ = object?.getZ();

                let changedObject = this.drawings.get(parsed_param.name)?.getLayerLinkedList().sendToBack(index as number);
                // let changedObject = this.layerLinkedList.sendToBack(index);

                if (changedObject) {

                    let command = new SendToBackCommand(object as VectorObjectClass, parsed_param.user, parsed_param.name, index as number, lastZ as number);

                    commandControllerService.addCommand(parsed_param.user, command);

                    this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                    .emit('edit_z', {
                        objects: changedObject
                    });
                }

                logging.info(this.NAMESPACE, "user [" + parsed_param.user + "] sent object [" + parsed_param.id + "] to the back.");
            }
            catch (error) {
                console.log(error);
            }
        })
    }

    private bringToFront(socket: Socket) {
        socket.on('bring_to_front', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);

                let object = this.drawings.get(parsed_param.name)?.getObjects().get(parsed_param.id);
                this.drawings.get(parsed_param.name)?.change();

                let index = this.drawings.get(parsed_param.name)?.getLayerLinkedList().getIndex(object as VectorObjectClass);
                // let index = this.layerLinkedList.getIndex(object as VectorObjectClass);

                let lastZ = object?.getZ();

                let changedObject = this.drawings.get(parsed_param.name)?.getLayerLinkedList().bringToFront(index as number);
                // let changedObject = this.layerLinkedList.bringToFront(index);

                if (changedObject) {

                    let command = new BringToFrontCommand(object as VectorObjectClass, parsed_param.user, parsed_param.name, index as number, lastZ as number);

                    commandControllerService.addCommand(parsed_param.user, command);

                    this.drawings.get(parsed_param.name)?.getNextZ();

                    this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                    .emit('edit_z', {
                        objects: changedObject
                    });
                }

                logging.info(this.NAMESPACE, "user [" + parsed_param.user + "] brought object [" + parsed_param.id + "] to the front.");
            }
            catch (error) {
                console.log(error);
            }
        })
    }

    private forward(socket: Socket) {
        socket.on('forward', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);

                let object = this.drawings.get(parsed_param.name)?.getObjects().get(parsed_param.id);
                this.drawings.get(parsed_param.name)?.change();

                let index = this.drawings.get(parsed_param.name)?.getLayerLinkedList().getIndex(object as VectorObjectClass);
                // let index = this.layerLinkedList.getIndex(object as VectorObjectClass);

                let changedObject = this.drawings.get(parsed_param.name)?.getLayerLinkedList().bumpUp(index as number);
                // let changedObject = this.layerLinkedList.bumpUp(index);

                if (changedObject) {

                    let command = new ForwardCommand(object as VectorObjectClass, parsed_param.user, parsed_param.name);

                    commandControllerService.addCommand(parsed_param.user, command);

                    this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                    .emit('edit_z', {
                        objects: changedObject
                    });
                }

                logging.info(this.NAMESPACE, "user [" + parsed_param.user + "] brought object [" + parsed_param.id + "] forward.");
            }
            catch (error) {
                console.log(error);
            }
        })
    }

    private backward(socket: Socket) {
        socket.on('backward', (params: any) => {
            try {
                const parsed_param = JSON.parse(params);

                let object = this.drawings.get(parsed_param.name)?.getObjects().get(parsed_param.id);
                this.drawings.get(parsed_param.name)?.change();

                let index = this.drawings.get(parsed_param.name)?.getLayerLinkedList().getIndex(object as VectorObjectClass);
                // let index = this.layerLinkedList.getIndex(object as VectorObjectClass);

                let changedObject = this.drawings.get(parsed_param.name)?.getLayerLinkedList().bumpDown(index as number);
                // let changedObject = this.layerLinkedList.bumpDown(index);

                if (changedObject) {

                    let command = new BackwardCommand(object as VectorObjectClass, parsed_param.user, parsed_param.name);

                    commandControllerService.addCommand(parsed_param.user, command);

                    this.io.in(SOCKET_ROOM_PREFIX + parsed_param.name)
                    .emit('edit_z', {
                        objects: changedObject
                    });
                }

                logging.info(this.NAMESPACE, "user [" + parsed_param.user + "] sent object [" + parsed_param.id + "] backward.");
            }
            catch (error) {
                console.log(error);
            }
        })
    }


    public getDrawings(): Map<string, Drawing> {
        return this.drawings;
    }

    public addDrawings(id: string, drawing: Drawing): void {
        this.drawings.set(id, drawing);
    }

    public getSelectedObjects(): Map<string, Array<any>> {
        return this.selectedObject;
    }
}

let drawingService: DrawingService = new DrawingService();

export default drawingService;