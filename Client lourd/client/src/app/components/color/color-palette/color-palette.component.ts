import { Component } from '@angular/core';

@Component({
  selector: 'app-color-palette',
  templateUrl: './color-palette.component.html',
  styleUrls: ['./color-palette.component.scss']
})

export class ColorPaletteComponent {

  color: string;
  primContainerSelected: boolean;

  constructor() {
    this.color = '';
    this.primContainerSelected = true;
  }

  emitted(color: string): void {
    this.color = color;
  }

  containerSelectEmitted(msg: boolean): void {
    this.primContainerSelected = msg;
  }

}
