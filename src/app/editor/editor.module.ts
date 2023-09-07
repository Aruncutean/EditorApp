import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './editor.component';
import { LeftEditorComponent } from './component/left-editor/left-editor.component';
import { ItemComponent } from './component/left-editor/item/item.component';
import { IconModule } from "../icon/icon.module";



@NgModule({
    declarations: [
        EditorComponent,
        LeftEditorComponent,
        ItemComponent
    ],
    imports: [
        CommonModule,
        IconModule
    ]
})
export class EditorModule { }
