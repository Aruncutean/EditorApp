import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditorModule } from './editor/editor.module';
import { HomeComponent } from './app/home/home.component';
import { AppPageComponent } from './app/app-page/app-page.component';
import { HttpClientModule } from '@angular/common/http';
import { IconModule } from './icon/icon.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AppPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    IconModule,
    BrowserAnimationsModule,

    EditorModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    NgbModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
