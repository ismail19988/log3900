import { Injectable } from '@angular/core';
import { Socket } from 'socket.io-client';
import { SocketService } from '../helperServices/socket.service';
import { UserService } from '../user/user.service';
import { AbstractToolService } from './abstract.service';
import { DrawingSvgService } from './drawing-svg.service';
import { SelectionService } from './selection.service';


@Injectable({
  providedIn: 'root'
})
export class EraserService extends AbstractToolService {
  
  protected name: string;

  setThickness(thickness: number): void {
    this.thickness = thickness
  }

  constructor(drawingHelper: DrawingSvgService, private socket: SocketService, private userService: UserService, private selection: SelectionService) {
    super(drawingHelper);
    this.hasThickness = false;
    //this.socket.initSocket();
    //this.initEfface(socket.getSocket());
  }

  public initEfface(socket: Socket){
    socket.on('delete', (data: {id: string, user: string, name: string}) => {
      console.log('deleting object', data.id)
      if(this.drawingHelper.objects.has(data.id)) {
        const index = this.drawingHelper.sortedGElements.indexOf(this.drawingHelper.gObjects.get(data.id + "-g") as SVGGraphicsElement);
        if (index > -1) {
          this.drawingHelper.sortedGElements.splice(index, 1);
        }
        this.drawingHelper.svg.nativeElement.removeChild(document.getElementById(data.id + "-g") as Node)
        this.drawingHelper.gObjects.delete(data.id + "-g");
        this.drawingHelper.objects.delete(data.id);
        this.drawingHelper.newSVGRender();
        this.selection.redrawCurrentUsersRect();

      }
    })
  }

  public eraseElement(id: string) {
    this.socket.getSocket().emit('delete', JSON.stringify({
      name: this.drawingHelper.choosedDrawing, id: id, user: this.userService.getCurrentUsername()
    }));
  }



}
