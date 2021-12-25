import { Injectable } from '@angular/core';
import { Line } from 'src/app/interfaces/drawing/line';
import { IMatrix } from 'src/app/interfaces/drawing/matrix';
import { Shape } from 'src/app/interfaces/drawing/shape';
import { SocketService } from '../helperServices/socket.service';
import { UserService } from '../user/user.service';
import { DrawingSvgService } from './drawing-svg.service';

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    // base color
    baseColor: RGBColor = { r: 255, g: 255, b: 255 };

    // primary Selected color
    private primarySelected: RGBColor = { r: 0, g: 0, b: 255 };

    // secondary selected color
    private secondarySelected: RGBColor = { r: 0, g: 0, b: 0 };

    // tertiary selected color
    private tertiarySelected: RGBColor = { r: 0, g: 0, b: 0 };

    private primaryTransparency: number;
    private secondaryTransparency: number;
    private tertiaryTransparency: number;

    private colorToPick: string;

    constructor(private drawingHelper: DrawingSvgService, private socket:SocketService, private userService:UserService) {
        this.primaryTransparency = 1;
        this.secondaryTransparency = 1;
        this.tertiaryTransparency = 1;

        this.colorToPick = 'primary';
    }

    setColorToPick(color: string): void {
        this.colorToPick = color;
    }

    getColorToPick(): string {
        return this.colorToPick;
    }

    setBaseRGB(base: RGBColor): void {
        this.baseColor = base;
    }

    setPrimarySelectedRGB(primary: RGBColor): void {
        this.primarySelected = primary;
        if(this.selectionMenu) {
            this.recolorSelection();
        }

    }

    setSecondarySelectedRGB(secondary: RGBColor): void {
        this.secondarySelected = secondary;
        if(this.selectionMenu){
            this.recolorSelection();
        }
    }

    public selectionMenu = false;

    recolorSelection() {
        let id = this.drawingHelper.selectedByUser;
        console.log('id', id);
        if(id !== '') {
            switch(this.drawingHelper.objects.get(id)?.tagName) {
                case 'ellipse':
                case 'rect':
                    this.socket.getSocket().emit('edit', JSON.stringify({
                        id: id,
                        name: this.drawingHelper.choosedDrawing,
                        user: this.userService.getCurrentUsername(),
                        shape: {
                            id: id,
                            color: this.getPrimaryLightClientRGB(),
                            strokeWidth: parseInt(this.drawingHelper.objects.get(id)?.getAttribute('stroke-width') as string),
                            strokeColor: this.getSecondaryLightClientRGB(), 
                            isSelected: true,
                            finalPoint : { x: 0, y: 0 },
                            initialPoint : { x: 0, y: 0 },
                            z: 0,
                            matrix: {
                                a: 1,
                                b: 0,
                                c: 0,
                                d: 1,
                                e: 0,
                                f: 0
                            } as IMatrix,
                            text: "",
                            textColor: this.getTertiaryLightClientRGB()
                        } as Shape
                    }))
                    break;
                case 'path':
                    this.socket.getSocket().emit('edit', JSON.stringify({
                        id: id,
                        name: this.drawingHelper.choosedDrawing,
                        user: this.userService.getCurrentUsername(),
                        line: {
                            id: id,
                            color: this.getPrimaryLightClientRGB(),
                            strokeWidth: parseInt(this.drawingHelper.objects.get(id)?.getAttribute('stroke-width') as string),
                            points : new Array(),
                            z: 0,
                            isSelected: true,
                            matrix: {
                                a: 1,
                                b: 0,
                                c: 0,
                                d: 1,
                                e: 0,
                                f: 0
                            } as IMatrix
                        } as Line
                    }))
                    break;
            }
        }
        
    }

    setTertiarySelectedRGB(tertiary: RGBColor): void {
        this.tertiarySelected = tertiary;
        if(this.selectionMenu){
            this.recolorSelection();
        }
    }

    getStringBaseColor(): string {
        return this.getDec(this.baseColor);
    }

    getPrimaryDecColor(): string {
        return this.getDec(this.primarySelected);
    }

    getSecondaryDecColor(): string {
        return this.getDec(this.secondarySelected);
    }

    getTertiaryDecColor(): string {
        return this.getDec(this.tertiarySelected);
    }

    private getDec(color: RGBColor): string {
        return 'rgba(' + color.r.toString() + ',' + color.g.toString() + ',' + color.b.toString() + ',' + '1' + ')';
    }

    getHexPrimaryColor(): string {
        return this.getHexColor(this.primarySelected);
    }

    getHexSecondaryColor(): string {
        return this.getHexColor(this.secondarySelected);
    }

    getHexTertiaryColor(): string {
        return this.getHexColor(this.tertiarySelected);
    }

    getHexColor(color: RGBColor): string {
        return '#' + this.decToHex(color.r) + this.decToHex(color.g) + this.decToHex(color.b);
    }

    private decToHex(dec: number): string {
        const FIFTEEN = 15;
        const HEX = 16;
        return dec <= FIFTEEN ? '0' + dec.toString(HEX) : dec.toString(HEX);
    }

    getPrimaryTransparency(): number {
        if(isNaN(this.primaryTransparency) || !this.primaryTransparency){
            this.primaryTransparency = 1;
        }
        return this.primaryTransparency;
    }

    getSecondaryTransparency(): number {
        if(isNaN(this.secondaryTransparency) || !this.secondaryTransparency){
            this.secondaryTransparency = 1;
        }
        return this.secondaryTransparency;
    }

    getTertiaryTransparency(): number {
        if(isNaN(this.tertiaryTransparency) || !this.tertiaryTransparency){
            this.tertiaryTransparency = 1;
        }
        return this.tertiaryTransparency;
    }

    setPrimaryTransparency(transparency: number): void {
        if(!transparency || isNaN(transparency)) {
            transparency = 1;
        }
        this.primaryTransparency = transparency;
        if(this.selectionMenu){
            this.recolorSelection();
        }
    }

    setSecondaryTransparency(transparency: number): void {
        if(!transparency || isNaN(transparency)) {
            transparency = 1
        }
        this.secondaryTransparency = transparency;
        if(this.selectionMenu){
            this.recolorSelection();
        }
    }

    setTertiaryTransparency(transparency: number): void {
        if(!this.secondaryTransparency || isNaN(transparency)) {
            this.secondaryTransparency = 1
        }
        this.tertiaryTransparency = transparency;
    }

    getPrimaryLightClientRGB() {
        if(isNaN(this.primaryTransparency) || !this.primaryTransparency){
            this.primaryTransparency = 1;
        }
        return '#' + Math.round(this.primaryTransparency*255).toString(16) + this.getHexPrimaryColor().substring(1);
    }

    getSecondaryLightClientRGB() {
        if(isNaN(this.secondaryTransparency) || !this.secondaryTransparency) {
            this.secondaryTransparency = 1;
        }
        return '#' + Math.round(this.secondaryTransparency*255).toString(16) + this.getHexSecondaryColor().substring(1);
    }

    getTertiaryLightClientRGB() {
        if(isNaN(this.tertiaryTransparency) || !this.tertiaryTransparency){
            this.tertiaryTransparency = 1;
        }
        return '#' + Math.round(this.tertiaryTransparency*255).toString(16) + this.getHexTertiaryColor().substring(1);
    }

    convertToHeavyClientSVG(color: string) {
        if(!color){
            color = '#ff000000';
        }
        return '#' + color.substring(3) + color.substring(1,3);
    }

    convertToLightClient(color:string) {
        if(!color){
            color = '#000000ff';
        }
        return '#' + color.substring(7,9) + color.substring(1,7);
    }

    public setColorFromShape(primary: string | null, secondary: string | null, tertiary: string | null ) {
        console.log('tertiary: ', tertiary);
        if(primary){
            let rpri = parseInt(primary.slice(1, 3), 16),
                gpri = parseInt(primary.slice(3, 5), 16),
                bpri = parseInt(primary.slice(5, 7), 16),
                apri = parseInt(primary.slice(7, 9), 16)/255;

            this.primarySelected = { r: rpri, g: gpri, b: bpri }
            this.primaryTransparency = apri;
        }

        if(secondary) {
            let rsec = parseInt(secondary.slice(1, 3), 16),
                gsec = parseInt(secondary.slice(3, 5), 16),
                bsec = parseInt(secondary.slice(5, 7), 16),
                asec = parseInt(secondary.slice(7, 9), 16)/255;
            this.secondarySelected = { r: rsec, g: gsec, b: bsec }
            this.secondaryTransparency = asec;
        }
        
        if(tertiary) {
            let rsec = parseInt(tertiary.slice(1, 3), 16),
                gsec = parseInt(tertiary.slice(3, 5), 16),
                bsec = parseInt(tertiary.slice(5, 7), 16),
                asec = parseInt(tertiary.slice(7, 9), 16)/255;
            this.tertiarySelected = { r: rsec, g: gsec, b: bsec }
            this.tertiaryTransparency = asec;
        }
        
    }
    
}


export interface RGBColor {
    r: number;
    g: number;
    b: number;
}
