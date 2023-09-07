import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CubComponent } from './cub.component';
import { CoordinatesComponent } from './coordinates.component';
import { ForegroundComponent } from './foreground.component';
import { IconInterface } from './icon.terface';


@NgModule({
    declarations: [
        CubComponent,
        CoordinatesComponent,
        ForegroundComponent,

    ],
    imports: [
        CommonModule
    ],
    exports: [
        CubComponent,
        CoordinatesComponent,
        ForegroundComponent
    ]
})
export class IconModule { }
