import { Privacy } from "../Enum/privacy";
import { VectorObjectClass } from "./shapes/vectorObject";
import { VectorObject } from "../interfaces/drawing/vectorObject";
import { IDrawing } from "../interfaces/drawing/drawing";
import { Line, instanceOfLine } from "../interfaces/drawing/line";
import { LineClass } from "./shapes/line";
import { instanceOfEllipse, instanceOfRectangle, Shape, TypedShape } from "../interfaces/drawing/shape";
import { ShapeClass } from "./shapes/shape";
import logging from "../config/logging";
import { RectangleClass } from "./shapes/rectangle";
import DatabaseService from "../services/databaseService";
import { DoublyLinkedList } from "./linkedList";
import { EllipseClass } from "./shapes/ellipse";

export class Drawing {
    /**
     * nom,
     * proprietaire,
     * mot de passe,
     * creatinTimestamp,
     * privacy
     * Objects
     */
     private name: string;
     private owner: string;
     private password: string;
     private creationTimestamp: number;
     private privacy: Privacy;
     private objects: Map<string, VectorObjectClass>;
     private activeUsers: Array<string>;
     private nextZ: number;
     private team: string | undefined;
     private changed = false;
     private layerLinkedList: DoublyLinkedList;
     private preview: string;
     public version: number = 0;
     public versions: number = 1;

     private NAMESPACE = "Drawing";

    constructor(
        drawing: IDrawing
    ) {
        this.name = drawing.name;
        this.owner = drawing.owner;
        this.password = drawing.password;
        this.creationTimestamp = drawing.creationTimestamp;
        this.privacy = drawing.privacy;
        this.nextZ = drawing.z;
        this.team = drawing.team;
        this.preview = drawing.preview;
        this.objects = new Map <string, VectorObjectClass>();
        this.activeUsers = new Array<string>();
        this.layerLinkedList = new DoublyLinkedList();
        this.version = drawing.version;
        this.versions = drawing.versions;

        let orderedObjects: Array<VectorObjectClass> = []

        drawing.objects.forEach((object: VectorObject) => {
            if (object.id === "PLACEHOLDER") {
                // skip placeholder
            }
            else if (instanceOfLine(object)) {
                const newLine = object as Line;
                let newLineObject = new LineClass(newLine)
                this.objects.set(newLine.id, newLineObject);
                orderedObjects.push(newLineObject);
            }
            else if (instanceOfRectangle(object)) {
                const newRectangle = object as Shape;
                let newRectangleObject = new RectangleClass(newRectangle)
                this.objects.set(newRectangle.id, newRectangleObject);
                orderedObjects.push(newRectangleObject);
            }
            else if (instanceOfEllipse(object)) {
                const newEllipse = object as Shape;
                let newEllipseObject = new EllipseClass(newEllipse)
                this.objects.set(newEllipse.id, newEllipseObject);
                orderedObjects.push(newEllipseObject);
            }
            else {
                logging.error(this.NAMESPACE, "Unhandled object detected.");
            }
        });

        orderedObjects = orderedObjects.sort(this.compare);
        orderedObjects.forEach(object => {
            this.layerLinkedList.insert(object);
        });

        this.save();
    }

    private compare(a: VectorObjectClass, b: VectorObjectClass) {

        if (a.getZ() < b.getZ()) {
            return -1;
        }

        if (a.getZ() > b.getZ()) {
           return 1;
        }
        
        return 0;
    }
    
    /*
    GETTERS
    */
    public getName(): string {
        return this.name;
    }

    public getTeam(): string | undefined {
        return this.team
    }

    public getOwner(): string {
        return this.owner;
    }

    public getPassword(): string {
        return this.password;
    }

    public getCreationTimestamp(): number {
        return this.creationTimestamp;
    }

    public getPrivacy(): Privacy {
        return this.privacy;
    }

    public getObjects(): Map<string, VectorObjectClass> {
        return this.objects;
    }

    private save(): void {
        this.saveDrawingDatabase();

        setTimeout(() => {
             this.save()
        }, 15000)
    }

    public async saveDrawingDatabase(): Promise<void> {
        if (this.changed) {
            await DatabaseService.updateDrawing(this.name, this.getVectorObjectsInterface(true), this.nextZ);
            await DatabaseService.save_current_version(this.name, this.getVectorObjectsInterface(true), this.version);
            this.changed = false;
        }
    }

    public getLayerLinkedList(): DoublyLinkedList {
        return this.layerLinkedList;
    }

    public getVectorObjectsInterface(ForDatabase : boolean): Array<VectorObject> {
        let ans = new Array<VectorObject>();
        this.objects.forEach((value) => {
            if(value instanceof ShapeClass) {
                ans.push({
                    color           :    value.getColor(),
                    id              :    value.getId(),
                    strokeWidth     :    value.getStrokeWidth(),
                    strokeColor     :    value.getStrokeColor(),
                    z               :    value.getZ(),
                    finalPoint      :    value.getFinalPoint(),
                    initialPoint    :    value.getInitialPoint(),
                    isSelected      :    ForDatabase ? false : value.getIsSelected(),
                    type            :    value instanceof RectangleClass ? 'rectangle' : 'ellipse',
                    matrix          :    value.getMatrix(),
                    text            :    value.getText(),
                    textColor       :    value.getTextColor()
                } as TypedShape)
            } else if (value instanceof LineClass) {
                ans.push({
                    color           :    value.getColor(),
                    id              :    value.getId(),
                    strokeWidth     :    value.getStrokeWidth(),
                    z               :    value.getZ(),
                    isSelected      :    ForDatabase ? false : value.getIsSelected(),
                    points          :    value.getPoints(),
                    matrix          :    value.getMatrix()
                } as Line) 
            }
        });

        return ans;
    }

    public change(){
        this.changed = true;
    }

    /*
    SETTERS
    */
    public setName(name: string): void {
        this.name = name;
    }

    public setOwner(owner: string): void {
        this.owner = owner;
    }

    public setPassword(password: string): void {
        this.password = password;
    }

    public addObject(id: string, object: VectorObjectClass): void {
        this.objects.set(id, object);
    }

    public removeObject(id: string): void {
        this.objects.delete(id);
    }

    public getActiveUsers(): Array<string> {
        return this.activeUsers;
    }

    public connectUser(user: string): void {
        if(!this.activeUsers.includes(user)) {
            this.activeUsers.push(user);
        }
    }

    public disconnectUser(user: string): void {
        let index = this.activeUsers.indexOf(user);
        index !== -1 && this.activeUsers.splice(index, 1);
    }

    public hasUser(user: string): boolean {
        return this.activeUsers.includes(user);
    }

    public getNextZ(): number {
        this.nextZ += 1;
        return this.nextZ;
    }

    public getLastZ(): number {
        return this.nextZ;
    }

    public setVersion(newVersion: number): void {
        this.version = newVersion
    }

    public setPreview(preview: string){
        this.preview = preview;
    }

    public getPreview() {
        return this.preview;
    }

}