import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './editor.component';
import { LeftEditorComponent } from './component/left-editor/left-editor.component';
import { ItemComponent } from './component/left-editor/item/item.component';
import { IconModule } from "../icon/icon.module";
import { FormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { ListObjectComponent } from './component/list-object/list-object.component';
import { EditorObjectComponent } from './component/editor-object/editor-object.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';

@NgModule({
    declarations: [
        EditorComponent,
        LeftEditorComponent,
        ItemComponent,
        ListObjectComponent,
        EditorObjectComponent
    ],
    imports: [
        CommonModule,
        IconModule,
        FormsModule,
        AngularSplitModule,
        MatTreeModule,
        MatIconModule,
        MatButtonModule,
        MatExpansionModule,
        MatListModule
    ]
})
export class EditorModule { }
