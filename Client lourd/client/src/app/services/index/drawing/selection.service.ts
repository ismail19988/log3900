import { Injectable } from '@angular/core';
import { Socket } from 'socket.io-client';
import { Line } from 'src/app/interfaces/drawing/line';
import { IMatrix } from 'src/app/interfaces/drawing/matrix';
import { Point } from 'src/app/interfaces/drawing/point';
import { Shape } from 'src/app/interfaces/drawing/shape';
import { SocketService } from '../helperServices/socket.service';
import { UserService } from '../user/user.service';
import { AbstractToolService } from './abstract.service';
import { ColorService } from './color.service';
import { DrawingSvgService } from './drawing-svg.service';
import { SelectionScaleService } from './selection-scale.service';

@Injectable({
    providedIn: 'root',
})

export class SelectionService extends AbstractToolService {

    setThickness(thickness: number): void { this.thickness = thickness }

    // consts keys

    private lastMouseLocation: Point = { x: -1, y: -1 };
    private translationStarted = false;

    protected readonly name: string;

    private SelectedElement: Map<string, SVGElement> =  new Map<string, SVGElement>();
    private SelectionRectangles: Map <string, SVGRectElement> = new Map <string, SVGRectElement>();
    private controlPoints: Map<string, SVGCircleElement[]> = new Map <string, SVGCircleElement[]>();
    public shapeTexts: Map<string, string> =  new Map<string, string>();
    private scalingStarted: boolean = false;

    public id: string = '';


    public resetSelection() {
        this.lastMouseLocation = { x: -1, y: -1 };
        this.translationStarted = false;
    
        this.SelectedElement =  new Map<string, SVGElement>();
        this.SelectionRectangles = new Map <string, SVGRectElement>();
        this.controlPoints = new Map <string, SVGCircleElement[]>();
        this.shapeTexts =  new Map<string, string>();
        this.scalingStarted = false;
        this.id = ''
    }
    
    constructor(
        public drawingHelper:    DrawingSvgService,
        public socket       :    SocketService,
        private userService :    UserService,
        private color       :    ColorService,
        private scaler      :    SelectionScaleService) {
        super(drawingHelper);
        this.name = 'Selection';

        window.addEventListener('keyup', (event: KeyboardEvent) => {
            if(this.id !== '') {
                if(event.key.length == 1) {
                    if(!this.shapeTexts.get(this.id)) {
                        this.shapeTexts.set(this.id, "");
                        this.startEdit(null, event.key);
                        this.endEdit();
                    } else {
                        this.startEdit(null, this.shapeTexts.get(this.id) + event.key);
                        this.endEdit();
                    }
                } else if(event.key == 'Backspace') {
                    if(this.shapeTexts.get(this.id) && this.shapeTexts.get(this.id)!.length > 0){
                        let text = "";
                        if((this.shapeTexts.get(this.id) as string).length > 1){
                            text = this.shapeTexts.get(this.id)!.slice(0, -1);
                        } else {
                            text = " ";
                        }
                        console.log('emitting backspace, text=['+ text + "]")
                        this.startEdit(null, text);
                        this.endEdit();
                    }
                }
            }
        });        
    }


    public initSelection(socket: Socket) {
        socket.on('select', (data: 
            {
                name    :   string,
                user    :   string
                id      :   string
            }) => {
            console.log('select', data);

            if(data.id != undefined && this.drawingHelper.objects.has(data.id)) {

                if(data.user == this.userService.getCurrentUsername()) {
                    this.unselect();
                    setTimeout(() => {
                        this.id = data.id;
                        this.drawingHelper.selectedByUser = data.id;
                    }, 50);
                }

                this.SelectElement(data.id, data.user == this.userService.getCurrentUsername());


                if(data.user == this.userService.getCurrentUsername()) {
                    var fill = this.drawingHelper.objects.get(data.id)?.getAttribute('fill');

                    if(fill === 'none'){
                        this.color.setColorFromShape(this.drawingHelper.objects.get(data.id)?.getAttribute('stroke') as string, null, null);
                    }

                    else {
                        let text_color: string | null = null;
                        var textDrawing = document.getElementById(data.id + "-t") as unknown as SVGTextElement;
                        if(textDrawing) {
                            textDrawing.childNodes.forEach((element) => {
                                text_color = (element as SVGTSpanElement).getAttribute('fill');
                                return;
                            })
                        }
                        this.color.setColorFromShape(fill as string, this.drawingHelper.objects.get(data.id)?.getAttribute('stroke') as string, text_color);
                    }

                }
            }
        })


        socket.on('unselect', (data: 
            {
                name    :   string,
                user    :   string,
                id      :   string
            }) => {
            console.log('unselect', data);

            if(this.id == data.id && data.user == this.userService.getCurrentUsername()) {
                this.id = '';
                this.drawingHelper.selectedByUser = '';
            }

            this.removeSelectionRect(data.id);
            this.SelectedElement.delete(data.id);
            this.SelectionRectangles.delete(data.id);

        });

        socket.on('edit_line', (data:
        {
            id      :   string,
            name    :   string,
            user    :   string,
            line    :   Line
        }) => {
            let object =  this.drawingHelper.objects.get(data.id);
            object?.setAttribute('stroke-width', data.line.strokeWidth.toString());
            object?.setAttribute('stroke', this.color.convertToHeavyClientSVG(data.line.color));

            this.rescaleG(data.id, data.line.matrix, false);

            if(data.line.isSelected)
                this.redrawSelectionRect(data.id, data.user == this.userService.getCurrentUsername());
        })

        socket.on('edit_rectangle', (data:
            {
                id          :   string,
                name        :   string,
                user        :   string,
                shape       :   Shape
            }) => {
                let object =  this.drawingHelper.objects.get(data.id);
                object?.setAttribute('fill', this.color.convertToHeavyClientSVG(data.shape.color));
                object?.setAttribute('stroke-width', data.shape.strokeWidth.toString());
                object?.setAttribute('stroke', this.color.convertToHeavyClientSVG(data.shape.strokeColor));

                if(!this.shapeTexts.get(data.id)) {
                    this.shapeTexts.set(data.id, "");
                }

                var textDrawing = document.getElementById(data.id + "-t") as unknown as SVGTextElement;

                if(textDrawing){
                    textDrawing.childNodes.forEach((element) => {
                        (element as SVGTSpanElement).setAttribute('fill', this.color.convertToHeavyClientSVG(data.shape.textColor));
                    })
                }
            

                if(data.shape.text) {
                    if(this.shapeTexts.get(data.id)!.length < data.shape.text.length) {
                        this.addTextToShape(data.id, this.getNewText(this.shapeTexts.get(data.id) as string, data.shape.text));
                    }
                    else {
                        this.removeTextFromShape(data.id, this.getRemovedText(this.shapeTexts.get(data.id) as string, data.shape.text), data.shape.text);
                    }
                }

                this.shapeTexts.set(data.id, data.shape.text);

                
                this.rescaleG(data.id, data.shape.matrix, false);

                if(data.shape.isSelected)
                    this.redrawSelectionRect(data.id, data.user == this.userService.getCurrentUsername());
        })
        
        socket.on('edit_ellipse', (data:
        {
            id      :   string,
            name    :   string,
            user    :   string,
            shape   :   Shape
        }) => {
            let object =  this.drawingHelper.objects.get(data.id);
            object?.setAttribute('fill', this.color.convertToHeavyClientSVG(data.shape.color));
            object?.setAttribute('stroke-width', data.shape.strokeWidth.toString());
            object?.setAttribute('stroke', this.color.convertToHeavyClientSVG(data.shape.strokeColor));

            if(!this.shapeTexts.get(data.id)){
                this.shapeTexts.set(data.id, "");
            }

            var textDrawing = document.getElementById(data.id + "-t") as unknown as SVGTextElement;

            if(textDrawing){
                textDrawing.childNodes.forEach((element) => {
                    (element as SVGTSpanElement).setAttribute('fill', this.color.convertToHeavyClientSVG(data.shape.textColor));
                })
            }
            

            if(data.shape.text) {
                if(this.shapeTexts.get(data.id)!.length < data.shape.text.length){
                    this.addTextToShape(data.id, this.getNewText(this.shapeTexts.get(data.id) as string, data.shape.text));
                } else {
                    this.removeTextFromShape(data.id, this.getRemovedText(this.shapeTexts.get(data.id) as string, data.shape.text), data.shape.text);
                }

                this.shapeTexts.set(data.id, data.shape.text);  
            }

            this.rescaleG(data.id, data.shape.matrix, false);

            if(data.shape.isSelected)
                this.redrawSelectionRect(data.id, data.user == this.userService.getCurrentUsername());

        })

        socket.on('edit_z', (data:
            {
                objects: Array<{ id: string, z: Number }>
            }) => {
            data.objects.forEach((object) => {
                console.log(object.id, object.z);
                this.drawingHelper.gObjects.get(object.id + "-g")?.setAttribute('z', object.z.toString());
            })

            this.drawingHelper.newSVGRender();
            this.redrawCurrentUsersRect();
        })
    }

    public redrawCurrentUsersRect(){
        if(this.id != '') {
            this.removeSelectionRect(this.id);
            this.redrawSelectionRect(this.id, true);
        }
    }

    private getNewText(textInShape: string, newText: string){
        return newText.substring(textInShape.length);
    }

    public SelectElement(id: string, fromUser:boolean): void {
        this.SelectedElement.set(id, this.drawingHelper.objects.get(id) as SVGElement);
        this.addSelectionRect(id,  fromUser);
    }


    private getRemovedText(textInShape: string, newText: string){

        if(textInShape.length === 1)
            return textInShape;

        return textInShape.substring(newText.length);
    }

    private addSelectionRect(id: string, fromUser: boolean): void {
        let domRect = this.drawingHelper.objects.get(id)?.getBoundingClientRect() as DOMRect;

        if(domRect.width < 3 && domRect.height < 3){
            return;
        }

        const rectElementX = domRect!.left - (this.drawingHelper.svg.nativeElement.parentElement?.parentElement as HTMLElement).getBoundingClientRect().left;
        const rectElementY = domRect!.top - (this.drawingHelper.svg.nativeElement.parentElement?.parentElement as HTMLElement).getBoundingClientRect().top;

        
        const rectangleDrawing = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectangleDrawing.setAttribute('width', (domRect!.width + 4).toString());
        rectangleDrawing.setAttribute('height', (domRect!.height + 4).toString());
        rectangleDrawing.setAttribute('x', (rectElementX - 2).toString());
        rectangleDrawing.setAttribute('y', (rectElementY - 2).toString());
        rectangleDrawing.setAttribute('stroke-dasharray', '5');
        rectangleDrawing.setAttribute('stroke-width', '3');
        rectangleDrawing.setAttribute('stroke', fromUser ? '#0078D7' : '#DE1738');
        rectangleDrawing.setAttribute('fill', 'transparent');
        rectangleDrawing.addEventListener('mousedown', (event: MouseEvent) => {
            if(this.drawingHelper.selectionChoosed) {
                this.translationStarted = true;
                this.lastMouseLocation = { x: event.offsetX,  y: event.offsetY }
                event.stopPropagation();
            }

        });



        this.SelectionRectangles.set(id, rectangleDrawing);
        this.drawingHelper.svg.nativeElement.appendChild(rectangleDrawing);

        if(fromUser) {
            this.addControlPoints(rectangleDrawing, id);
        }

    }


    // consts control points
    private readonly CONTROL_TOP: number = 0;
    private readonly CONTROL_RIGHT: number = 1;
    private readonly CONTROL_LEFT: number = 2;
    private readonly CONTROL_BOTTOM: number = 3;

    public colorEnableControlPoint(){
        if(this.id != ''){
            if(this.controlPoints.get(this.id) != undefined) {
                this.controlPoints.get(this.id)!.forEach((point) => {
                    point.setAttribute('fill', this.drawingHelper.selectionChoosed ? '#0078D7' : '#DE1738');
                })
            }
        }
    }

    private addControlPoints(rect: SVGRectElement, id: string) {

        let domRect = this.drawingHelper.objects.get(id)?.getBoundingClientRect() as DOMRect;
        const rectElementX = domRect!.left - (this.drawingHelper.svg.nativeElement.parentElement?.parentElement as HTMLElement).getBoundingClientRect().left;
        const rectElementY = domRect!.top - (this.drawingHelper.svg.nativeElement.parentElement?.parentElement as HTMLElement).getBoundingClientRect().top;

        const points: { x: number; y: number }[] = [];
        const scaleTo: { x: number; y: number }[] = [];
        const scaleFrom: { x: number; y: number }[] = [];
        const numberOfPoints = 4;

        let selectionRect = this.SelectionRectangles.get(id) as SVGRectElement;

        let x = +(selectionRect.getAttribute('x') as string);
        let y = +(selectionRect.getAttribute('y') as string);

        let width = +(selectionRect.getAttribute('width') as string);
        let height = +(selectionRect.getAttribute('height') as string);

        points[this.CONTROL_TOP] = { x: x + domRect.width / 2, y: rectElementY };
        points[this.CONTROL_RIGHT] = { x: x + domRect.width, y: rectElementY + domRect.height / 2 };
        points[this.CONTROL_LEFT] = { x: rectElementX, y: rectElementY + domRect.height / 2 };
        points[this.CONTROL_BOTTOM] = { x: rectElementX + domRect.width / 2, y: (rectElementY + domRect.height) };

        scaleTo[this.CONTROL_TOP] =    { x: x + width / 2,   y: y };
        scaleTo[this.CONTROL_RIGHT] =  { x: x + width,       y: y + height / 2 };
        scaleTo[this.CONTROL_LEFT] =   { x: x,               y: y + height / 2 };
        scaleTo[this.CONTROL_BOTTOM] = { x: x + width / 2,   y: y + height };

        scaleFrom[this.CONTROL_BOTTOM] =    { x: x + width / 2,   y: y };
        scaleFrom[this.CONTROL_LEFT] =  { x: x + width,       y: y + height / 2 };
        scaleFrom[this.CONTROL_RIGHT] =   { x: x,               y: y + height / 2 };
        scaleFrom[this.CONTROL_TOP] = { x: x + width / 2,   y: y + height };


        this.controlPoints.set(id, []);

        for (let i = 0; i < numberOfPoints; i++) {
            const controlPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            controlPoint.setAttribute('stroke-width', '0.75');
            controlPoint.setAttribute('stroke', 'black');
            controlPoint.setAttribute('fill', this.drawingHelper.selectionChoosed ? '#0078D7' : '#DE1738');
            controlPoint.setAttribute('r', '7');
            controlPoint.setAttribute('cx', points[i].x.toString());
            controlPoint.setAttribute('cy', points[i].y.toString());
            controlPoint.addEventListener('mousedown', (event) => {

                if(this.drawingHelper.selectionChoosed){
                    this.scaler.controlPoint = i;
                    this.scaler.domRect =  this.getDomRect();
                    this.scaler.oppositeBound = false;
                    this.scalingStarted = true;
                    event.stopPropagation();
                }

            });

            this.controlPoints.get(id)![i] = controlPoint;
            this.drawingHelper.svg.nativeElement.appendChild(controlPoint);

        }

    }

    private scaleElements(event: MouseEvent): { Xt: number, Yt: number, Xs: number, Ys: number } {
        let transformation = this.scaler.calculateScale(event);

        this.calculateNewTransformationMatrix(null, { x: -transformation.Xt, y: -transformation.Yt }, null);
        this.calculateNewTransformationMatrix(null, null, {x: transformation.Xs, y: transformation.Ys });
        this.calculateNewTransformationMatrix(null, { x: transformation.Xt, y: transformation.Yt }, null);

        this.redrawSelectionRect(this.id, true)

        this.scaler.domRect =  this.getDomRect();

        return transformation;
    }

    getDomRect(): {x: number, y: number, x2: number, y2: number, width: number, height: number } {
        let selectionRect = this.SelectionRectangles.get(this.id) as SVGRectElement;
        return {
            x: +(selectionRect.getAttribute('x') as string),
            y: +(selectionRect.getAttribute('y') as string),
            x2: +(selectionRect.getAttribute('x') as string) + +(selectionRect.getAttribute('width') as string),
            y2: +(selectionRect.getAttribute('y') as string) + +(selectionRect.getAttribute('height') as string),
            width: +(selectionRect.getAttribute('width') as string),
            height: +(selectionRect.getAttribute('height') as string)
        };
    }


    public addTextToShape(id: string, textToAdd: string, color? : string) {

        if(!textToAdd){
            return;
        }

        if(!color){
            color = this.color.getHexTertiaryColor()
            console.log('color was null setted to', this.color.getHexTertiaryColor());
        } else {
            console.log('we got color')
            color = this.color.convertToHeavyClientSVG(color);
        }

        let object = this.drawingHelper.objects.get(id);

        let rectElementX;
        let rectElementY;

        let width, height;
        if(this.drawingHelper.objects.get(id)?.tagName == 'ellipse') {
            width = parseFloat(this.drawingHelper.objects.get(id)?.getAttribute('rx') as string) * 2;
            height = parseFloat(this.drawingHelper.objects.get(id)?.getAttribute('ry') as string) * 2;
            rectElementX = parseFloat(object?.getAttribute('cx') as string) - width/2;
            rectElementY = parseFloat(object?.getAttribute('cy') as string) - height/2;

        }
        else {
            rectElementX = parseFloat(object?.getAttribute('x') as string);
            rectElementY = parseFloat(object?.getAttribute('y') as string);
            width = parseFloat(this.drawingHelper.objects.get(id)?.getAttribute('width') as string);
            height = parseFloat(this.drawingHelper.objects.get(id)?.getAttribute('height') as string);
        }

        const cx = rectElementX + width/2

        var textDrawing = document.getElementById(id + "-t") as unknown as SVGTextElement;
        console.log(textDrawing)

        if(!textDrawing) {
            textDrawing = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textDrawing.setAttribute('id', id + '-t');
            textDrawing.setAttribute('x', rectElementX.toString());
            textDrawing.setAttribute('y', rectElementY.toString());
            textDrawing.setAttribute('dominant-baseline', 'middle');
            textDrawing.setAttribute('text-anchor', 'middle');
            const g = document.getElementById(id + "-g");
            g?.appendChild(textDrawing);
        }

        for(let i = 0; i < textToAdd.length; i++) {
            const textSpan = document.getElementById(id + '-t' + '-' + textDrawing?.childElementCount.toString()) as unknown as SVGTSpanElement
            if(textSpan && textSpan.getComputedTextLength() <= width - 30) {
                textSpan!.textContent = textSpan!.textContent + textToAdd.charAt(i);
            } else {
                const textSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                textSpan.setAttribute('id', id + "-t" + '-' + (textDrawing!.childElementCount + 1).toString())
                textSpan.setAttribute('fill', color);
                textSpan.setAttribute('dy', '1.2em');
                // textSpan.setAttribute('font', 'bold 10px sans-serif;');
                textSpan.setAttribute('x', cx.toString())
                textSpan.setAttribute('dominant-baseline', 'middle');
                textSpan.setAttribute('text-anchor', 'middle');
                textSpan.textContent = textToAdd.charAt(i);
                textDrawing?.appendChild(textSpan);
            }
        }
    }


    private removeTextFromShape(id: string, textToRemove: string, newText: string) {

        if(!document.getElementById(id  + '-t')) {
            return;
        }

        const textDrawing = document.getElementById(id + '-t');

        if(textDrawing?.childElementCount == 0)
            return;
        
        for(let i = 0; i < textToRemove.length; i++) {
            const textSpan = document.getElementById(id + '-t' + '-' + textDrawing?.childElementCount.toString()) as unknown as SVGTSpanElement;
            textSpan.textContent = textSpan.textContent?.slice(0, -1) as string;
            if(textSpan.textContent.length == 0) {
                textDrawing?.removeChild(textSpan);
            }
        }
    }


    private removeSelectionRect(id: string): void {
        if(this.drawingHelper.svg.nativeElement.contains(this.SelectionRectangles.get(id) as SVGRectElement))
            this.drawingHelper.svg.nativeElement.removeChild(this.SelectionRectangles.get(id) as SVGRectElement);

        if(this.controlPoints.get(id) !== undefined) {
            this.controlPoints.get(id)!.forEach((point) => {
                if(this.drawingHelper.svg.nativeElement.contains(point))
                    this.drawingHelper.svg.nativeElement.removeChild(point);
            })
        }
    }

    public select(id: string): void {
        if(id && id !== '' && !this.SelectedElement.has(id)) {
            console.log('emitting selection')
            this.socket.getSocket().emit('select', JSON.stringify({ user: this.userService.getCurrentUsername(), name: this.drawingHelper.choosedDrawing, id: id }));
        }
    }

    mouseDown(event: MouseEvent): void {
        this.unselect();
    }

    mouseMove(event: MouseEvent): void {
        if(this.translationStarted && this.id != '') {
             
            let translation = {
                x: (event.offsetX - this.lastMouseLocation.x),
                y: (event.offsetY - this.lastMouseLocation.y)
            } 
            this.calculateNewTransformationMatrix(null, translation, null);
            this.startEdit(null, null);
            
        }
        this.lastMouseLocation.x = event.offsetX;
        this.lastMouseLocation.y = event.offsetY;

        if(this.scalingStarted && this.id != '') {
            this.scaleElements(event);
            this.startEdit(null, null);
        }

    }

    private redrawSelectionRect(id: string, fromUser: boolean) {
        this.removeSelectionRect(id);
        this.addSelectionRect(id, id === this.id);
    }
    
    mouseUp(event: MouseEvent): void {

        if(this.translationStarted || this.scalingStarted)
            this.endEdit();

        this.translationStarted = false;
        this.scalingStarted = false;
    }

    unselect(): void {
        if(this.id && this.id !== '' && this.SelectedElement.has(this.id)){
            this.socket.getSocket().emit('unselect', JSON.stringify(
                {
                    user    :   this.userService.getCurrentUsername(),
                    name    :   this.drawingHelper.choosedDrawing,
                    id      :   this.id
                })
            );
        }
    }
   
    deleteSelection(): void {
        if(this.id !== '') {
            this.socket.getSocket().emit('delete', JSON.stringify({
                name: this.drawingHelper.choosedDrawing, id: this.id, user: this.userService.getCurrentUsername()
              }));
        }
    }

    public startEdit(strokeWidth: number | null, text: string | null): void {

        let object = this.drawingHelper.gObjects.get(this.id + "-g");
        let matrice = object?.transform.baseVal.consolidate()?.matrix;
        let z = parseInt(object?.getAttribute('z') as string);

        if(!matrice) {
            matrice = document.querySelector('svg')?.createSVGMatrix();
        }


        switch(this.drawingHelper.objects.get(this.id)?.tagName) {
            case 'ellipse':
            case 'rect':
                this.socket.getSocket().emit('start_edit',
                    JSON.stringify({
                        id      : this.id,
                        name    : this.drawingHelper.choosedDrawing,
                        user    : this.userService.getCurrentUsername(),
                        shape   : {
                            id              :   this.id,
                            color           :   this.color.convertToLightClient(this.drawingHelper.objects.get(this.id)?.getAttribute('fill') as string),
                            strokeWidth     :   strokeWidth ? strokeWidth : parseInt(this.drawingHelper.objects.get(this.id)?.getAttribute('stroke-width') as string),
                            strokeColor     :   this.color.convertToLightClient(this.drawingHelper.objects.get(this.id)?.getAttribute('stroke') as string),
                            isSelected      :   true,
                            finalPoint      :   { x: 0, y: 0 },
                            initialPoint    :   { x: 0, y: 0 },
                            z               :   z,
                            matrix          :   {
                                                    a   :    matrice!.a,
                                                    b   :    matrice!.b,
                                                    c   :    matrice!.c,
                                                    d   :    matrice!.d,
                                                    e   :    matrice!.e,
                                                    f   :    matrice!.f
                                                } as IMatrix,
                            text            : text ? text : this.shapeTexts.get(this.id),
                            textColor       : this.color.getTertiaryLightClientRGB()

                        } as Shape
                    })
                )
                break;
            case 'path':
                this.socket.getSocket().emit('start_edit',
                JSON.stringify({
                        id: this.id,
                        name: this.drawingHelper.choosedDrawing,
                        user: this.userService.getCurrentUsername(),
                        line: {
                            id          :   this.id,
                            color       :   this.color.convertToLightClient(this.drawingHelper.objects.get(this.id)?.getAttribute('stroke') as string),
                            strokeWidth :   strokeWidth ? strokeWidth : parseInt(this.drawingHelper.objects.get(this.id)?.getAttribute('stroke-width') as string),
                            points      :   [],
                            z           :   z,
                            isSelected  :   true,
                            matrix      :   {
                                                a   :   matrice!.a,
                                                b   :   matrice!.b,
                                                c   :   matrice!.c,
                                                d   :   matrice!.d,
                                                e   :   matrice!.e,
                                                f   :   matrice!.f
                                            } as IMatrix
                        } as Line
                    })
                )
                break;
        }
    }

    calculateNewTransformationMatrix(rotation: number | null, translation: Point | null, scaleFactor: { x: number, y: number } | null): void {
        
        let object = this.drawingHelper.gObjects.get(this.id + "-g");

        let matrix = object?.transform.baseVal.consolidate()?.matrix;

        if(!matrix) {
            matrix = document.querySelector('svg')?.createSVGMatrix();
        }

        const rectElementX = object!.getBoundingClientRect().left - (this.drawingHelper.svg.nativeElement as SVGElement).getBoundingClientRect().left;
        const rectElementY = object!.getBoundingClientRect().top - (this.drawingHelper.svg.nativeElement as SVGElement).getBoundingClientRect().top;
        const width  = +(object!.getBoundingClientRect().width);
        const height = +(object!.getBoundingClientRect().height);

        let cx = rectElementX + width / 2;
        let cy = rectElementY + height / 2;

        if(translation) {
            let translation_matrix  = document.querySelector('svg')?.createSVGMatrix();
            translation_matrix!.e   = parseFloat(translation.x.toFixed(4))
            translation_matrix!.f   = parseFloat(translation.y.toFixed(4))
            matrix = translation_matrix?.multiply(matrix);
        }

        if(rotation) {
            let rotation_matrix = document.querySelector('svg')?.createSVGMatrix();
            var ca = Math.cos(rotation * Math.PI / 180);
            var sa = Math.sin(rotation * Math.PI / 180);

            rotation_matrix!.a = parseFloat(ca.toFixed(4));
            rotation_matrix!.b = parseFloat(sa.toFixed(4));
            rotation_matrix!.c = parseFloat((-sa).toFixed(4));
            rotation_matrix!.d = parseFloat(ca.toFixed(4));
            rotation_matrix!.e = parseFloat(((-ca * cx) + (sa * cy) + cx).toFixed(4));
            rotation_matrix!.f = parseFloat(((-sa * cx) - (ca * cy) + cy).toFixed(4));

            matrix = rotation_matrix?.multiply(matrix);
        }

        if(scaleFactor) {
            let scalingMatrix = document.querySelector('svg')?.createSVGMatrix();
            scalingMatrix!.a = scaleFactor.x;
            scalingMatrix!.d = scaleFactor.y;
            matrix = scalingMatrix?.multiply(matrix);
        }

        let tr = object?.transform.baseVal.createSVGTransformFromMatrix(matrix as DOMMatrix);
        object?.transform.baseVal.clear();

        if(tr) {
            object?.transform.baseVal.appendItem(tr);
        }
    }

    public endEdit(): void{
        this.socket.getSocket().emit('end_edit', JSON.stringify({
            id: this.id,
            name:this.drawingHelper.choosedDrawing,
            user: this.userService.getCurrentUsername(),
        }))
    }

    checkIfShapeSelected(): boolean {
        if(this.id !== ''){            
            switch(this.drawingHelper.objects.get(this.id)?.tagName) {
                case 'ellipse': 
                case 'rect': 
                    return true;
                case 'path': 
                    return false;
            }
        }
        return false;
    }


    public somethingSelected(): boolean {
        return this.id !== '';
    }

    public getSelectedId(): string {
        return this.id;
    }
}


