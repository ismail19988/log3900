import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractToolService } from 'src/app/services/index/drawing/abstract.service';
import { DrawingSvgService } from 'src/app/services/index/drawing/drawing-svg.service';
import { NewDrawingService } from 'src/app/services/index/helperServices/new-drawing.service';
import { SocketService } from 'src/app/services/index/helperServices/socket.service';
import { GET_DRAWING_DATA } from 'src/utils/constants';
import {browserRefresh} from '../app/app.component';

@Component({
    selector: 'app-drawing-picture',
    templateUrl: './drawing-picture.component.html',
    styleUrls: ['./drawing-picture.component.scss'],
})
export class DrawingPictureComponent implements OnChanges, AfterViewInit, OnDestroy {
    @ViewChild('myGsection', { static: false }) gSection: ElementRef<SVGElement>;
    @ViewChild('svgEl', { static: false }) svg: ElementRef<SVGElement>;

    @Input() currentTool: AbstractToolService;
    @Input() showGrid: boolean;
    @Input() squareSize: number;
    @Input() gridOpacity: number;
    browserRefresh: boolean;

    constructor(
        public drawingSvgService: DrawingSvgService,
        private newDrawingService: NewDrawingService,
        private socket: SocketService,
        private http: HttpClient
    ) { }

    ngOnDestroy(): void {
        this.drawingSvgService.clearAll();
    }
    ngAfterViewInit(): void {
        this.browserRefresh = browserRefresh;
        this.currentTool.svg = this.gSection;
        this.drawingSvgService.svg = this.svg;
        this.newDrawingService.initSVGFromServerData();

        if(this.socket.socketInitiated) {
            if(!this.socket.versions) {
                this.socket.getSocket().on('changed_version', () => {
                    console.log('received changed version')
                    this.drawingSvgService.serverElements = [];
                    this.reloadDrawing();
                });

                this.socket.getSocket().on("new_version", (res: any) => {
                    this.drawingSvgService.drawing_versions = res.versions;
                    console.log('new_version total = ', this.drawingSvgService.drawing_versions);
                })
                this.socket.versions = true;
            }
            
        }
        this.svg.nativeElement.addEventListener('contextmenu', (event) => { event.preventDefault(); });
        window.addEventListener('wheel', (event) => { event.preventDefault(); });
    }

    private reloadDrawing(): void {
        console.log("reloading drawing");
        this.http.post(GET_DRAWING_DATA, { drawing: this.drawingSvgService.choosedDrawing }).subscribe((res: any) => {
            if(res.drawing) {

                this.drawingSvgService.serverElements = res.drawing.objects;
                console.log('elements received', this.drawingSvgService.serverElements);
                this.newDrawingService.initSVGFromServerData();

                this.drawingSvgService.drawing_version = res.drawing.version;
                this.drawingSvgService.drawing_versions = res.drawing.versions;
                console.log('receinved versions:', res.drawing.versions);
            }
            else {
                console.log(res);
            }
        })
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.currentTool) {
            this.currentTool.svg = this.gSection;
        }
    }

    mouseDown(event: MouseEvent): void {
        this.currentTool.mouseDown(event);
    }
    mouseMove(event: MouseEvent): void {
        this.currentTool.mouseMove(event);
    }

    mouseUp(event: MouseEvent): void {
        this.currentTool.mouseUp(event);
    }

    mouseLeave(event: MouseEvent): void {
        this.currentTool.mouseUp(event);
        document.body.style.cursor = 'default';
    }

    doubleClick(event: MouseEvent): void {
        this.currentTool.doubleClick(event);
    }
}
