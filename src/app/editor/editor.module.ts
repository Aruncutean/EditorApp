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
import { HeaderTabsComponent } from './component/editor-object/header-tabs/header-tabs.component';
import { ObjectPropComponent } from './component/editor-object/object-prop/object-prop.component';
import { MaterialPropComponent } from './component/editor-object/material-prop/material-prop.component';
import { ModifiersPropComponent } from './component/editor-object/modifiers-prop/modifiers-prop.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CdkMenuModule } from '@angular/cdk/menu';
import { SceneService } from './service/scene.service';
import { LightPropComponent } from './component/editor-object/light-prop/light-prop.component';
import { MAT_COLOR_FORMATS, NGX_MAT_COLOR_FORMATS, NgxMatColorPickerModule } from '@angular-material-components/color-picker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';

@NgModule({
    declarations: [
        EditorComponent,
        LeftEditorComponent,
        ItemComponent,
        ListObjectComponent,
        EditorObjectComponent,
        HeaderTabsComponent,
        ObjectPropComponent,
        MaterialPropComponent,
        ModifiersPropComponent,
        LightPropComponent
    ],
    imports: [
        CommonModule,
        IconModule,
        ReactiveFormsModule,
        CdkMenuModule,
        AngularSplitModule,
        MatTreeModule,
        MatIconModule,
        MatButtonModule,
        MatExpansionModule,
        MatListModule,
        NgxMatColorPickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSliderModule,
        FormsModule
    ],
    providers: [
        SceneService,
        { provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS }
    ]
})
export class EditorModule { }
