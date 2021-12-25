import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ColorPaletteComponent} from './components/color/color-palette/color-palette.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { EntryPointComponent } from './components/entry-point/entry-point.component';
import { WorkspaceComponent } from './components/workspace/workspace.component';
import { ChatComponent } from './components/chatcomponents/chat/chat.component';
import { GalleryDessinComponent } from './components/main-menu/gallery-dessin/gallery-dessin.component';

// This is my case
const routes: Routes = [
    {
        path : '',
        component : LoginComponent
    },
    {
        path: 'register',
        component : RegisterComponent
    },
    {
        path: 'chat',
        component : ChatComponent
    },
    {
        path : 'entry',
        component : EntryPointComponent
    },
    {
        path : 'workspace',
        component : WorkspaceComponent
    },
    {
        path: 'color',
        component : ColorPaletteComponent
    },
    {
        path: 'gallery-dessin',
        component : GalleryDessinComponent
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
      // onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})

export class AppRoutingModule { }
