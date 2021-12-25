import { AfterViewInit, Component, ElementRef, HostListener, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ColorService } from 'src/app/services/index/drawing/color.service';
import { AbstractShapeService } from 'src/app/services/index/drawing/abstract-shape.service';
import { AbstractToolService } from 'src/app/services/index/drawing/abstract.service';
import { DrawingSvgService } from 'src/app/services/index/drawing/drawing-svg.service';
import { EllipseService } from 'src/app/services/index/drawing/ellipse.service';
import { EraserService } from 'src/app/services/index/drawing/eraser.service';
import { PencilService } from 'src/app/services/index/drawing/pencil.service';
import { RectangleService } from 'src/app/services/index/drawing/rectangle.service';
import { SelectionService } from 'src/app/services/index/drawing/selection.service';
import { ColorPaletteComponent } from '../color/color-palette/color-palette.component';
import { ThemesComponent } from '../themes/themes.component';
import { SocketService } from 'src/app/services/index/helperServices/socket.service';
import { UserService } from 'src/app/services/index/user/user.service';
import { ChatService } from 'src/app/services/index/chat/chatService';
import { HttpClient } from '@angular/common/http';
import { LEAVE_DRAWING, SWAP_VERSION, NEW_VERSION } from 'src/utils/constants';
import { Router } from '@angular/router';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { Title } from 'src/app/model/Iresponse';
import { ThemesService } from 'src/app/services/index/themes.service';

@Component({
    selector: 'app-workspace',
    templateUrl: './workspace.component.html',
    styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent implements AfterViewInit {
    @ViewChild('WorkingSpace', { static: false }) workingSpaceRef: ElementRef;
    @ViewChild('saveIcon', { static: false }) saveIcon: ElementRef;
    @ViewChildren('Option') optionsRef!: QueryList<ElementRef>;

    @ViewChild('ThicknessSlider', { static: false })
    thicknessSlider: MatSlider;

    // Index consts
    readonly SELECTION_INDEX: number = 1;
    readonly PENCIL_INDEX: number = 2;
    readonly RECTANGLE_INDEX: number = 3;
    readonly ELLIPSE_INDEX: number = 4;
    readonly HISTORY_INDEX: number = 5;

    // Max, min and default consts
    readonly MIN_THICKNESS: number = 1;
    readonly DEFAULT_THICKNESS: number = 5;
    readonly MAX_THICKNESS: number = 25;
    // Max, min for rotation
    readonly MIN_ROTATION: number = 0;
    readonly ROTATION_INTERVAL: number = 60;
    readonly MAX_ROTATION: number = 360;

    readonly UNDO_REDO_KEY: string = 'z';

    currentOptionIndex: number;
    options: ElementRef[];
    selectedTool: AbstractToolService = this.rectangle;
    selectedShape: AbstractShapeService;
    selectedColorTool: AbstractToolService;

    tools: AbstractToolService[];
    shapes: AbstractToolService[];
    tracesName: string[];

    currentRotation: number = this.MIN_ROTATION;
    oldRotation: number = this.MIN_ROTATION;

    showDiameterOption: boolean;
    ctrlPressed: boolean;
    shiftPressed: boolean;
    showGridOption: boolean;

    chatIsWindow: boolean = this.chatService.getChatType();

    toolIsPencil: boolean = true;

    @Output()
    activeTool: AbstractToolService = this.selection;

    keyMap: Map<string, AbstractToolService>;


    @HostListener('window:keydown', ['$event'])
    keyDownEvent(event: KeyboardEvent): void {
        if ((document.activeElement as HTMLElement).nodeName.toLowerCase() !== 'input' && !this.drawingSvgService.isModalOpened) {
            if (event.ctrlKey) {
                event.preventDefault();
                event.stopPropagation();
                switch (event.key.toLowerCase()) {
                    case this.UNDO_REDO_KEY: {
                        if (event.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                    }
                }
            }
        }
    }

    currentTheme: string = this.themesService.getCurrentTheme();

    // import other tools
    constructor(
        public pencil: PencilService,
        public noTool: AbstractToolService,
        public rectangle: RectangleService,
        public ellipse: EllipseService,
        public eraser: EraserService,
        public dialog: MatDialog,
        public color: ColorService,
        public drawingSvgService: DrawingSvgService,
        public selection: SelectionService,
        public drawingHelper: DrawingSvgService,
        public socket: SocketService,
        public userService: UserService,
        private socketService: SocketService,
        private chatService: ChatService,
        private http: HttpClient, 
        private router: Router,
        private themesService:ThemesService
    ) {
        this.tools = [pencil, eraser];
        this.shapes = [rectangle, ellipse];
        this.selectedShape = this.rectangle;
        this.selectedTool = this.pencil;
        this.currentOptionIndex = 0;
        this.showDiameterOption = false;
        this.ctrlPressed = false;
        this.shiftPressed = false;
        this.showGridOption = false;

        window.addEventListener('wheel', (event) => {
            event.preventDefault();
        });

        window.addEventListener('mouseup', (event) => {
            if(this.rotationStarted){
                this.rotationStarted = false;
                this.selection.endEdit();
            }

            if(this.ThicknessStarted) {
                this.ThicknessStarted = false;
                this.selection.endEdit();
            }
        });
    }

    ngAfterViewInit(): void {
        console.log('versions', this.drawingHelper.drawing_versions)
    }

    openColor(selection: boolean): void {
        this.color.selectionMenu = selection;
        this.dialog.open(ColorPaletteComponent, { maxWidth: '400px', width: '400px', height:'450px' });
    }


    changeTool(targetTool: AbstractToolService, lockToolParameters: boolean = false): void {

        if(targetTool !== this.selection){
            this.selection.unselect();
        }

        if (targetTool !== this.noTool) {
          if (this.shapes.includes(targetTool)) {
              this.selectedShape = targetTool as AbstractShapeService;
              if(this.shapes[0] == targetTool){
                this.toggleOptions(this.RECTANGLE_INDEX, lockToolParameters);
              }else if(this.shapes[1] == targetTool){
                this.toggleOptions(this.ELLIPSE_INDEX, lockToolParameters);
              }
          } else if (this.tools.includes(targetTool)) {
              this.selectedTool = targetTool;
              this.toggleOptions(this.PENCIL_INDEX, lockToolParameters);
          }
        }
        if (targetTool.getHasThickness()) {
            (this.thicknessSlider as MatSlider).value = targetTool.getThickness();
        }

        this.drawingHelper.selectionChoosed = targetTool === this.selection;
        this.drawingHelper.eraserChoosed = targetTool === this.eraser;

        if(targetTool == this.selection) {
            this.selection.colorEnableControlPoint();
        }
        this.activeTool = targetTool;

    }

    toggleOptions(newOptionIndex: number, lockPanel: boolean = false): void {
        if (this.options === undefined) {
            this.options = this.optionsRef.toArray();
        }

        const workingSpace = this.workingSpaceRef.nativeElement;
        const oldOption = this.options[this.currentOptionIndex].nativeElement;
        const newOption = this.options[newOptionIndex].nativeElement;

        // Change option
        if (oldOption !== newOption) {
            oldOption.classList.remove('currentOption');
            oldOption.classList.remove('currentOptionShowned');
            newOption.classList.add('currentOption');

            // Change option considering if new option is default or not
            if (!newOption.classList.contains('defaultOption')) {
                newOption.classList.add('currentOptionShowned');
                workingSpace.classList.add('smallWorkingSpace');
            } else {
                workingSpace.classList.remove('smallWorkingSpace');
            }
        } else if (!oldOption.classList.contains('defaultOption')) {
            // Close
            if (oldOption.classList.contains('currentOptionShowned') && !lockPanel) {
                newOption.classList.remove('currentOptionShowned');
                workingSpace.classList.remove('smallWorkingSpace');
            } else {
                newOption.classList.add('currentOptionShowned');
                workingSpace.classList.add('smallWorkingSpace');
            }
        }

        this.currentOptionIndex = newOptionIndex;
    }

    updateThickness(event: MatSliderChange): void {
        this.activeTool.setThickness(event.value as number);
    }

    updateRotation(event: MatSliderChange): void {
        if(this.rotationStarted) {
            this.currentRotation = event.value as number;
            let rotation = (this.currentRotation - this.oldRotation) % 360;
            this.selection.calculateNewTransformationMatrix(rotation, null, null);
            this.selection.startEdit(null, null);
            this.oldRotation = this.currentRotation;
        }
    }

    private rotationStarted = false;

    startRotation(){
        this.rotationStarted = true
    }

    endRotation() {
        this.rotationStarted = false;
    }


    private ThicknessStarted = false;

    startThickness() {
        this.ThicknessStarted = true
    }

    endThickness() {
        this.ThicknessStarted = false;
    }

    undo(): void {
        console.log('undo');
        this.socket.getSocket().emit('undo', JSON.stringify({ user: this.userService.getCurrentUsername() }));
    }

    redo(): void {
        console.log('redo');
        this.socket.getSocket().emit('redo', JSON.stringify({ user: this.userService.getCurrentUsername() }));
    }

    deleteSelection(): void {
        this.selection.deleteSelection();
    }

    colorElement(): void {
    }

    updateThicknessSelection(event: MatSliderChange) {
        console.log('here', event.value)
        if(this.ThicknessStarted) {
            this.currentRotation = event.value as number;
            this.selection.startEdit(event.value, null);
        }
    }

    checkIfShape(): boolean {
        return this.selection.checkIfShapeSelected();
    }

    getJpegBytes(canvas: HTMLCanvasElement) {
        return new Promise((resolve, reject) => {
          const fileReader = new FileReader()
      
          fileReader.addEventListener('loadend', function () {
            if (this.error) {
              reject(this.error)
            } else {
              resolve(this.result)
            }
          })
      
          canvas.toBlob(blob => fileReader.readAsArrayBuffer(blob as Blob), 'image/jpeg')
        })
      }

      pngByteArray : Array<Number>;

    goToGallery(): void {

        var svgElement = document.getElementById('svgEl') as any;
        let { width, height } = svgElement.getBBox(); 
        let clonedSvgElement = svgElement.cloneNode(true);
        let outerHTML = clonedSvgElement.outerHTML,
        blob = new Blob([outerHTML],{type:'image/svg+xml;charset=utf-8'});
        let URL = window.URL || window.webkitURL || window;
        let blobURL = URL.createObjectURL(blob);
        let image = new Image();
        image.onload = async () => {
           let canvas = document.createElement('canvas');
           canvas.width = width;
           canvas.height = height;
           let context = canvas.getContext('2d');
           context!.drawImage(image, 0, 0, width, height);
           await this.getJpegBytes(canvas)
           .then(arrayBuffer => {
                var typedArray = new Uint8Array(arrayBuffer as ArrayBuffer);
                this.pngByteArray = Array.from(typedArray);
           }).catch((err) => {
                this.pngByteArray = [];
           })

           this.http.post(LEAVE_DRAWING, { user: this.userService.getCurrentUsername(), drawing: this.drawingHelper.choosedDrawing, preview : this.pngByteArray }).subscribe((res: any) => {
                if(res.title == Title.AUTHORIZED) {
                    console.log(res)
                    setTimeout(() => {
                        this.router.navigate(['/gallery-dessin']);
                    }, 100)
                }
            })

        };
        image.src = blobURL;
    
    }

    logout(): void {
        this.socketService.disconnectSocket();
        this.router.navigate(['/']);
    }

    sendToBack(){
        if(this.selection.somethingSelected()){
            this.socket.getSocket().emit('send_to_back', JSON.stringify({ id: this.selection.getSelectedId(), user: this.userService.getCurrentUsername(), name: this.drawingHelper.choosedDrawing }));
            console.log('sent', { id: this.selection.getSelectedId(), user: this.userService.getCurrentUsername(), name: this.drawingHelper.choosedDrawing })
        }
    }

    bringToFront(){
        if(this.selection.somethingSelected())
            this.socket.getSocket().emit('bring_to_front', JSON.stringify({ id: this.selection.getSelectedId(), user: this.userService.getCurrentUsername(), name: this.drawingHelper.choosedDrawing }));
            console.log('sent', { id: this.selection.getSelectedId(), user: this.userService.getCurrentUsername(), name: this.drawingHelper.choosedDrawing })
    }

    moveBack(){
        if(this.selection.somethingSelected()){
            this.socket.getSocket().emit('backward', JSON.stringify({ id: this.selection.getSelectedId(), user: this.userService.getCurrentUsername(), name: this.drawingHelper.choosedDrawing }));
            console.log('sent', { id: this.selection.getSelectedId(), user: this.userService.getCurrentUsername(), name: this.drawingHelper.choosedDrawing })
        }
    }

    moveFront(){
        if(this.selection.somethingSelected())
            this.socket.getSocket().emit('forward', JSON.stringify({ id: this.selection.getSelectedId(), user: this.userService.getCurrentUsername(), name: this.drawingHelper.choosedDrawing }));
            console.log('sent', { id: this.selection.getSelectedId(), user: this.userService.getCurrentUsername(), name: this.drawingHelper.choosedDrawing })
    }



    swapVersion(version: number){
        //la dont on va faire le http request.......
        this.http.post(SWAP_VERSION, { drawing: this.drawingHelper.choosedDrawing, version: version }).subscribe((res: any) => {
            if(res.title == Title.AUTHORIZED) {
                console.log('version swapped');
            } else {
                console.log(res.title, 'nope bro');
            }
        })
    }

    newVersion(){
        this.http.post(NEW_VERSION, {drawing: this.drawingHelper.choosedDrawing, user: this.userService.getCurrentUsername() }).subscribe((res: any) => {
            console.log('new_version', res)
            if (res.title == Title.AUTHORIZED) {
                console.log('nouvelle version');
            } else {
                console.log(res.title, 'nope bro');
            }
        })
    }

    checkVersion(version: number){
        if(version == this.drawingSvgService.drawing_version){
            return true;
        }else 
        return false;
    }

    openThemes(): void {
        this.dialog.open(ThemesComponent, {
          width: '30%',
          height: '25%',
          data: {},
          panelClass: this.themesService.getThemesModalColor()
        })
      }
    
}
