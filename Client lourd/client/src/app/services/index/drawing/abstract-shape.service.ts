import { Injectable } from '@angular/core';
import { AbstractToolService } from './abstract.service';
import { DrawingSvgService } from './drawing-svg.service';

@Injectable({
  providedIn: 'root'
})
export abstract class AbstractShapeService extends AbstractToolService {
  protected hasNbPoints: boolean;
  typeOfTrace: string;

    constructor(public drawingHelper: DrawingSvgService) {
        super(drawingHelper);
        this.hasNbPoints = false;
        this.typeOfTrace = 'Plein + Contour';
    }

    getHasNbPoints(): boolean {
      return this.hasNbPoints;
    }

}
