import { Injectable } from '@angular/core';
import { Line } from 'src/app/interfaces/drawing/line';
import { Shape, TypedShape } from 'src/app/interfaces/drawing/shape';
import { VectorObject } from 'src/app/interfaces/drawing/vectorObject';
import { DrawingSvgService } from '../drawing/drawing-svg.service';
import { EllipseService } from '../drawing/ellipse.service';
import { PencilService } from '../drawing/pencil.service';
import { RectangleService } from '../drawing/rectangle.service';
import { SelectionService } from '../drawing/selection.service';

@Injectable({
  providedIn: 'root'
})

export class NewDrawingService {

  constructor(
    private drawingHelper: DrawingSvgService,
    private rectService: RectangleService,
    private elliService: EllipseService,
    private pathService: PencilService,
    private selection :SelectionService
    ) { }


  initSVGFromServerData() {
    this.drawingHelper.clearAll();

    this.drawingHelper.serverElements = this.drawingHelper.serverElements.sort(this.compare);
    this.selection.shapeTexts.clear();

    this.drawingHelper.serverElements.forEach((object) => {
        if('type' in object){
            // shape
            if((object as TypedShape).type == 'ellipse') {
                // ellipse
                this.renderEllipse(object as Shape);
            } else {
                // rectangle
                this.renderRectangle(object as Shape);
            }
            if((object as Shape).text != '') {
              this.selection.addTextToShape((object as Shape).id, (object as Shape).text, (object as Shape).textColor);
              this.selection.shapeTexts.set((object as Shape).id,(object as Shape).text);
            }
        } else {
            //trait
            this.renderPath(object as Line)
        }
    })
    this.drawingHelper.serverElements = [];
}

renderPath(path: Line) {
  this.pathService.renderLine(path);
}

private compare(a: VectorObject, b: VectorObject) {

  if (a.z < b.z){
      return -1;
  }

  if (a.z > b.z){
     return 1;
  }
  
  return 0;
}

renderRectangle(rect: Shape) {
  this.rectService.initialiseRectangle(rect);
}

renderEllipse(ellipse: Shape) {
  this.elliService.initialiseEllipse(ellipse);
}


}
