import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { ColorService } from './color.service';
import { AbstractToolService } from './abstract.service';
import { DrawingSvgService } from './drawing-svg.service';
import { SocketService } from '../helperServices/socket.service';
import { Socket } from 'socket.io-client';
import { Line } from 'src/app/interfaces/drawing/line';
import { Point } from 'src/app/interfaces/drawing/point';
import { SelectionService } from './selection.service';
import { UserService } from '../user/user.service';
import { EraserService } from './eraser.service';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends AbstractToolService {
    protected name: string;
    renderer2: Renderer2;
    //lines: Map<string, SVGPathElement> = new Map<string, SVGPathElement>();
    private lineStarted: boolean;

    constructor(public color: ColorService, protected rendererFactory: RendererFactory2,
        drawingHelper: DrawingSvgService,
        public socket: SocketService,
        private selection: SelectionService,
        private userService: UserService,
        private eraser: EraserService) {
        super(drawingHelper);
        this.renderer2 = rendererFactory.createRenderer(null, null);
        this.hasThickness = this.hasColor = true;
        this.name = 'Crayon';
        this.lineStarted = false;
        // Appeler init pencil dans la fonction de login et non ici.
        //this.socket.initSocket();
        //this.initPencil(socket.getSocket());
    }


    public initPencil(socket: Socket) {

        socket.on('create_line', (data: { line: Line, user: string }) => {

            // TODO a changer
            console.log('create_line', data)
            if (data.user == this.userService.getCurrentUsername())
                this.id = data.line.id as string;

            this.renderLine(data.line);
        });

        socket.on('draw_line', (data: {id:string, point: Point}) => {
            this.appendPoint(data);
        });
    }

    setThickness(thickness: number): void {
        this.thickness = thickness;
    }

    // start Drawing

    public appendPoint(param: { id: string, point: Point }) {
        let line = this.drawingHelper.objects.get(param.id)
        line !== undefined &&
            line.setAttribute('d', (line.getAttribute('d') as string) + ' L ' + param.point.x.toString() + ' ' + param.point.y.toString());

    }

    mouseDown(event: MouseEvent): void {
        this.id = '';
        let params = {
            name: this.drawingHelper.choosedDrawing,
            color: this.color.getPrimaryLightClientRGB(),
            startingPoint: { x: event.offsetX, y: event.offsetY },
            strokeWidth: this.thickness,
            user: this.userService.getCurrentUsername(),
            id: '',
            isSelected: false,
            matrix: {
                a: 1,
                b: 0,
                c: 0,
                d: 1,
                e: 0,
                f: 0
            },
            points: [],
            z: 0
        } as Line;
        this.socket.getSocket().emit("create_line", JSON.stringify(params));
        this.lineStarted = true;
    }

    renderLine(line: Line): void {

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', line.id + "-g");
        g.setAttribute('z', line.z ? line.z.toString() : '0');

        const pathDrawing = this.renderer2.createElement('path', 'svg');
        pathDrawing.setAttribute('fill', 'none');
        pathDrawing.setAttribute('d', 'M ' + line.points[0].x.toString() + ' ' + line.points[0].y.toString());
        pathDrawing.setAttribute('stroke', this.color.convertToHeavyClientSVG(line.color));
        pathDrawing.setAttribute('stroke-width', line.strokeWidth);
        pathDrawing.setAttribute('stroke-linecap', 'round');
        pathDrawing.setAttribute('stroke-linejoin', 'round');
        pathDrawing.setAttribute('id', line.id);
        pathDrawing.addEventListener('mousedown', (event: MouseEvent) => {

           
            if(this.drawingHelper.selectionChoosed) {
                console.log('icitte2')
                this.selection.select(line.id);
                event.stopPropagation();
            }

            else if(this.drawingHelper.eraserChoosed) {
                this.eraser.eraseElement(line.id);
                event.stopPropagation();
            }
        
        });
        
        this.drawingHelper.objects.set(line.id, pathDrawing);
        this.drawingHelper.gObjects.set(line.id + "-g", g);
        this.drawingHelper.sortedGElements.push(g);

        g.appendChild(pathDrawing);

        if(line.matrix){
            let matrix = this.generateTransformationMatrix(line.matrix)
            this.rescaleG(line.id, matrix, true);
        }

        if(line.points.length > 1) {
            line.points.forEach((point) => {
                this.appendPoint({id: line.id, point})
            })
        }

        this.drawingHelper.pushElementToMainSVG(g);
        if(line.isSelected){
            this.selection.SelectElement(line.id, false);
        }

    }

    // draw Line
    mouseMove(event: MouseEvent): void {
        if (this.lineStarted && !(this.id === "")) {
            this.socket.getSocket().emit("draw_line", JSON.stringify({ user: this.userService.getCurrentUsername(), id: this.id, name: this.drawingHelper.choosedDrawing, point: { x: event.offsetX, y: event.offsetY } }))
        }
    }

    // end Drawing
    mouseUp(event: MouseEvent): void {
        if (this.lineStarted) {
            this.lineStarted = false;
            this.socket.getSocket().emit('end_drawing', JSON.stringify({name: this.drawingHelper.choosedDrawing, user: this.userService.getCurrentUsername(), id: this.id }));

        }
    }

    // stop drawing
    mouseLeave(): void {
        this.lineStarted = false;
    }
}
