import { Injectable } from '@angular/core';
import { ColorService } from './color.service';
import { AbstractShapeService } from './abstract-shape.service';
import { DrawingSvgService } from './drawing-svg.service';
import { Shape } from 'src/app/interfaces/drawing/shape';
import { Point } from 'src/app/interfaces/drawing/point';
import { SocketService } from '../helperServices/socket.service';
import { Socket } from 'socket.io-client';
import { UserService } from '../user/user.service';
import { SelectionService } from './selection.service';
import { EraserService } from './eraser.service';
import { endDraw } from 'src/app/interfaces/drawing/endDraw';

@Injectable({
    providedIn: 'root'
})

export class EllipseService extends AbstractShapeService {
    protected name: string;
    private ellipseStarted: boolean;
    isInitialized = false;

    //ellipses: Map<string, SVGEllipseElement> = new Map<string, SVGEllipseElement>();
    initPoints: Map<string, Point> =  new Map<string, Point>();
    
    constructor(
        private color: ColorService,
        drawingHelper: DrawingSvgService,
        public socket: SocketService,
        private userService: UserService,
        private selection: SelectionService,
        private eraser: EraserService
        ) {
        super(drawingHelper);
        this.name = 'Ellipse';
        this.ellipseStarted = false;
        this.hasTrace = false
        this.hasColor = this.hasThickness = true;
        //this.socket.initSocket();
    }

    initEllipse(socket: Socket) {
        socket.on('create_ellipse', (data: { shape: Shape, user: string }) => {

            if (data.user == this.userService.getCurrentUser().name) {
                this.id = data.shape.id;
            }

            this.initialiseEllipse(data.shape);
        });

        socket.on('draw_ellipse', (data: { name:  string, user: string, id: string, point: Point }) => {
            this.updateEllipse(data);
        });

    }

    setThickness(thickness: number): void {
        this.thickness = thickness;
    }

    public initialiseEllipse(ellipse: Shape): void {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', ellipse.id + "-g");
        g.setAttribute('z', ellipse.z ? ellipse.z.toString() : '0');

        const ellipseDrawing = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        let rx = Math.abs(ellipse.finalPoint.x - ellipse.initialPoint.x) / 2;
        let ry = Math.abs(ellipse.finalPoint.y - ellipse.initialPoint.y) / 2;
        let cx = (ellipse.finalPoint.x > ellipse.initialPoint.x) ? ellipse.initialPoint.x + rx : ellipse.finalPoint.x + rx;
        let cy = (ellipse.finalPoint.y > ellipse.initialPoint.y) ? ellipse.initialPoint.y + ry : ellipse.finalPoint.y + ry;
        ellipseDrawing.setAttribute('rx', rx.toString());
        ellipseDrawing.setAttribute('ry', ry.toString());
        ellipseDrawing.setAttribute('cx', cx.toString());
        ellipseDrawing.setAttribute('cy', cy.toString());
        ellipseDrawing.setAttribute('stroke-width', ellipse.strokeWidth.toString());
        ellipseDrawing.setAttribute('stroke',  this.color.convertToHeavyClientSVG(ellipse.strokeColor));
        ellipseDrawing.setAttribute('fill',  this.color.convertToHeavyClientSVG(ellipse.color));

        ellipseDrawing.addEventListener('mousedown', (event: MouseEvent) => {

            if(this.drawingHelper.selectionChoosed) {
                this.selection.select(ellipse.id);
                event.stopPropagation();
            }

            else if(this.drawingHelper.eraserChoosed) {
                this.eraser.eraseElement(ellipse.id);
                event.stopPropagation();
            }


        });

        this.drawingHelper.objects.set(ellipse.id, ellipseDrawing);
        this.drawingHelper.gObjects.set(ellipse.id + "-g", g);
        this.drawingHelper.sortedGElements.push(g);

        g.appendChild(ellipseDrawing);

        if(ellipse.matrix){
            let matrix = this.generateTransformationMatrix(ellipse.matrix)
            this.rescaleG(ellipse.id, matrix, true);
        }

        this.drawingHelper.pushElementToMainSVG(g);
        this.initPoints.set(ellipse.id, { x: ellipse.initialPoint.x, y: ellipse.initialPoint.y })
        if(ellipse.isSelected){
            this.selection.SelectElement(ellipse.id, false);
        }
    }

    mouseDown(event: MouseEvent): void {
        this.id = "";
        if (!this.ellipseStarted) {
            this.ellipseStarted = true;

            this.socket.getSocket().emit('create_ellipse', JSON.stringify({
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
                text : "",
                textColor: this.color.getTertiaryLightClientRGB()

            } as Shape));
        }
    }

    mouseMove(event: MouseEvent): void {
        if (this.ellipseStarted && !(this.id === ""))
            this.socket.getSocket().emit('draw_ellipse', JSON.stringify({
                name: this.drawingHelper.choosedDrawing,
                user: this.userService.getCurrentUser().name,
                id: this.id,
                finalPoint: {
                     x: event.offsetX,
                     y: event.offsetY
                } as Point
            } as endDraw));
    }

    private updateEllipse(data: { name:  string, user: string, id: string, point: Point }): void {

        let startX = this.initPoints.get(data.id)?.x as number
        let startY = this.initPoints.get(data.id)?.y as number

        let rx = Math.abs(data.point.x - startX) / 2;
        let ry = Math.abs(data.point.y - startY) / 2;

        let newCx = 0;
        let newCy = 0;

        newCx = ((data.point.x < startX) ? data.point.x : startX) + rx;
        newCy = ((data.point.y < startY) ? data.point.y : startY) + ry;

        this.renderSVG(data.id, newCx, newCy, rx, ry);
    }
    
    mouseUp(event: MouseEvent): void {
        if (this.ellipseStarted) {
            this.ellipseStarted = false;
            this.socket.getSocket().emit('end_drawing', JSON.stringify({ name: this.drawingHelper.choosedDrawing, user: this.userService.getCurrentUsername(), id: this.id }));
            this.id = "";
        }
    }

    private renderSVG(id: string, cx: number, cy: number, rx: number, ry: number): void {
        let ellipse = this.drawingHelper.objects.get(id);
        if (ellipse !== undefined) {
            ellipse.setAttribute('rx', rx.toString());
            ellipse.setAttribute('ry', ry.toString());
            ellipse.setAttribute('cx', cx.toString());
            ellipse.setAttribute('cy', cy.toString());
        }
    }
}
