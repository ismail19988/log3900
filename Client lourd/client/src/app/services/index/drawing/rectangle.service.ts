import {  Injectable, OnInit } from '@angular/core';
import { ColorService } from './color.service';
import { AbstractShapeService } from './abstract-shape.service';
import { DrawingSvgService } from './drawing-svg.service';
import { SocketService } from '../helperServices/socket.service';
import { Socket } from 'socket.io-client';
import { Shape } from 'src/app/interfaces/drawing/shape';
import { Point } from 'src/app/interfaces/drawing/point';
import { UserService } from '../user/user.service';
import { SelectionService } from './selection.service';
import { EraserService } from './eraser.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends AbstractShapeService implements OnInit {
    protected name: string;
    private rectangleStarted: boolean;
    isInitialized = false;

    //rectangles: Map<string, SVGRectElement> = new Map<string, SVGRectElement>();
    initPoints: Map<string, Point> =  new Map<string, Point>();

    constructor(
        protected color: ColorService,
        drawingHelper: DrawingSvgService,
        public socket: SocketService,
        private userService: UserService,
        private selection : SelectionService,
        private eraser: EraserService) {
        super(drawingHelper);

        this.hasColor = this.hasThickness = true;
        this.hasTrace = false
        this.name = 'Rectangle';
        this.rectangleStarted = false;
        //this.socket.initSocket();
        //this.initRectangle(this.socket.getSocket());
    }

    public initRectangle(socket: Socket) {
        socket.on('create_rectangle', (data: { shape: Shape, user: string }) => {

            if (data.user == this.userService.getCurrentUser().name){
                this.id = data.shape.id;
            }

            this.initialiseRectangle(data.shape);
        });

        socket.on('draw_rectangle', (data: { name:  string, user: string, id: string, point: Point }) => {
            this.updateRectangle(data);
        });

    }

    setThickness(thickness: number): void {
        this.thickness = thickness;
    }

    ngOnInit(): void {
    }

    private min(val1: number, val2: number){
        if(val1 < val2){
            return val1
        }
        return val2
    }

    public initialiseRectangle(rectangle: Shape): void {

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', rectangle.id + "-g");
        g.setAttribute('z', rectangle.z ? rectangle.z.toString() : '0');

        const rectangleDrawing = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        let width = Math.abs(rectangle.finalPoint.x - rectangle.initialPoint.x);
        let height = Math.abs(rectangle.finalPoint.y - rectangle.initialPoint.y);
        rectangle.initialPoint.x = this.min(rectangle.initialPoint.x, rectangle.finalPoint.x);
        rectangle.initialPoint.y = this.min(rectangle.initialPoint.y, rectangle.finalPoint.y);
        rectangleDrawing.setAttribute('width', width.toString());
        rectangleDrawing.setAttribute('height', height.toString());
        rectangleDrawing.setAttribute('x', rectangle.initialPoint.x.toString());
        rectangleDrawing.setAttribute('y', rectangle.initialPoint.y.toString());
        rectangleDrawing.setAttribute('stroke-width', rectangle.strokeWidth.toString());
        rectangleDrawing.setAttribute('stroke', this.color.convertToHeavyClientSVG(rectangle.strokeColor));
        rectangleDrawing.setAttribute('fill',  this.color.convertToHeavyClientSVG(rectangle.color));
        rectangleDrawing.setAttribute('id', rectangle.id);

        /** Event for selecting */
        rectangleDrawing.addEventListener('mousedown', (event: MouseEvent) => {

            if(this.drawingHelper.selectionChoosed) {
                this.selection.select(rectangle.id);
                event.stopPropagation();
            }
            
            else if(this.drawingHelper.eraserChoosed) {
                this.eraser.eraseElement(rectangle.id);
                event.stopPropagation();
            }

        });

        this.drawingHelper.gObjects.set(rectangle.id + "-g", g)
        this.drawingHelper.objects.set(rectangle.id, rectangleDrawing);
        this.drawingHelper.sortedGElements.push(g);

        g.appendChild(rectangleDrawing);
        
        if(rectangle.matrix){
            let matrix = this.generateTransformationMatrix(rectangle.matrix);
            this.rescaleG(rectangle.id, matrix, true);
        }

        this.initPoints.set(rectangle.id, {x: rectangle.initialPoint.x, y: rectangle.initialPoint.y })
        this.drawingHelper.pushElementToMainSVG(g);

        if(rectangle.isSelected){
            this.selection.SelectElement(rectangle.id, false);
        }
    }


    mouseDown(event: MouseEvent): void {
        this.id = '';
        if(!this.rectangleStarted) {
        this.rectangleStarted = true;
            this.socket.getSocket().emit('create_rectangle',
             JSON.stringify({
                user: this.userService.getCurrentUser().name,
                name: this.drawingHelper.choosedDrawing,
                color: this.color.getPrimaryLightClientRGB(),
                strokeWidth: this.thickness,
                strokeColor: this.color.getSecondaryLightClientRGB(),
                initialPoint: {
                    x: event.offsetX, y: event.offsetY
                }, 
                finalPoint: {
                    x: event.offsetX, y: event.offsetY
                },
                z: 0,
                isSelected: false,
                id : '',
                matrix: {
                    a: 1,
                    b: 0,
                    c: 0,
                    d: 1,
                    e: 0,
                    f: 0
                },
                text: "",
                textColor: this.color.getTertiaryLightClientRGB()
            } as Shape));
        }
    }

    mouseMove(event: MouseEvent): void {
        if (this.rectangleStarted && !(this.id === ""))
            this.socket.getSocket().emit('draw_rectangle', JSON.stringify({ name: this.drawingHelper.choosedDrawing, user: this.userService.getCurrentUser().name, id: this.id,  finalPoint: { x: event.offsetX, y: event.offsetY } }));
    }

    private updateRectangle(data: { name:  string, user: string, id: string, point: Point }): void {

        let startX = this.initPoints.get(data.id)?.x as number
        let startY = this.initPoints.get(data.id)?.y as number

        let width = Math.abs(data.point.x - startX);
        let height = Math.abs(data.point.y - startY);

        let newX = 0;
        let newY = 0;

        if (data.point.x < startX) {
            newX = data.point.x;
        } else {
            newX = startX
        }

        if (data.point.y < startY) {
            newY = data.point.y;
        } else {
            newY = startY;
        }

        this.renderSVG(data.id, newX, newY, width, height);
    }

    mouseUp(event: MouseEvent): void {
        if (this.rectangleStarted) {
            this.rectangleStarted = false;
            this.socket.getSocket().emit('end_drawing', JSON.stringify({name: this.drawingHelper.choosedDrawing, user: this.userService.getCurrentUsername(), id: this.id }));
            this.id = "";
        }
    }


    private renderSVG(id: string, x: number, y: number, width: number, height: number): void {
        let rect = this.drawingHelper.objects.get(id);
        if(rect !== undefined) {
            rect.setAttribute('width', width.toString());
            rect.setAttribute('height', height.toString());
            rect.setAttribute('x', x.toString());
            rect.setAttribute('y', y.toString());
        }
    }
}
