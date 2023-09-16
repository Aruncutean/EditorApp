import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CubComponent } from './cub.component';
import { CoordinatesComponent } from './coordinates.component';
import { ForegroundComponent } from './foreground.component';
import { IconInterface } from './icon.terface';
import { CubTabComponent } from './cubTab.component';


@NgModule({
    declarations: [
        CubComponent,
        CoordinatesComponent,
        ForegroundComponent,
        CubTabComponent,
    ],
    imports: [
        CommonModule
    ],
    exports: [
        CubComponent,
        CoordinatesComponent,
        ForegroundComponent,
        CubTabComponent
    ]
})
export class IconModule { }
