import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorComponent } from './editor/editor.component';
import { HomeComponent } from './app/home/home.component';
import { AppPageComponent } from './app/app-page/app-page.component';

const routes: Routes = [
  { path: 'editor', component: EditorComponent },
  { path: 'application', component: AppPageComponent },
  { path: '', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
