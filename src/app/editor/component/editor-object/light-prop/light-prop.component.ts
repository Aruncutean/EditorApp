import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { Mesh } from 'src/app/editor/class/Mesh';
import { Light } from 'src/app/editor/interface/LightInterface';
import { SceneService } from 'src/app/editor/service/scene.service';

@Component({
  selector: 'app-light-prop',
  templateUrl: './light-prop.component.html',
  styleUrls: ['./light-prop.component.scss']
})
export class LightPropComponent implements OnInit, AfterViewInit {


  colorCtr: AbstractControl = new FormControl("");
  specular = 0;
  diffuse = 0;
  meshSelected!: Mesh
  light!: Light;
  dirLight!: Light;
  colorIn = "#ffffff"

  isPointLight = false;
  transformForm = new FormGroup({
    xLocation: new FormControl(0),
    yLocation: new FormControl(0),
    zLocation: new FormControl(0),
    specular: new FormControl(0),
    ambient: new FormControl(0),
    diffuse: new FormControl(0)
  });
  constructor(private sceneService: SceneService,
    private cds: ChangeDetectorRef) { }


  ngOnInit(): void {
    this.sceneService.data$.subscribe(_ => {
      _.meshSelected && (this.meshSelected = _.meshSelected);
      this.dirLight = _.dirLight;
      this.setValue();

      let index = _.light.findIndex(_ => _.mesh && _.mesh.id == this.meshSelected.id)
      if (index != -1) {
        let l = _.light.at(index);
        l && (this.light = l);
        l && l.diffuse && (this.diffuse = l.diffuse?.[0])
        l && l.specular && (this.specular = l.specular?.[0])
        this.isPointLight = true;
      } else {
        this.isPointLight = false;
      }

      this.cds && this.cds.detectChanges();
    })
  }

  setValue() {
    this.dirLight && this.transformForm.setValue({
      xLocation: Number(this.dirLight.position?.x.toFixed(2)),
      yLocation: Number(this.dirLight.position?.y.toFixed(2)),
      zLocation: Number(this.dirLight.position?.z.toFixed(2)),
      ambient: Number(this.dirLight.ambient),
      specular: Number(this.dirLight.specular?.[0]),
      diffuse: Number(this.dirLight.diffuse?.[0]),
    })

  }

  ngAfterViewInit(): void {

  }

  valueChange(type: any) {
    if (type == "specular") {
      this.light && (this.light.specular = [this.specular, this.specular, this.specular]);

    } else if (type == "diffuse") {
      this.light && (this.light.diffuse = [this.diffuse, this.diffuse, this.diffuse]);

    }
  }

  formatLabel(value: number): string {
    this.specular = value;

    return `${value}`;
  }
  updateColor(event: any, type: any) {
    if (type == 'point') {
      this.light.ambient = [event.value.r / 255, event.value.g / 255, event.value.b / 255];
    }
    if (type == 'dir') {
      this.dirLight.ambient = [event.value.r / 255, event.value.g / 255, event.value.b / 255];
    }
  }

  valueChangeInput() {
    if (this.dirLight && this.dirLight.position) {
      this.dirLight.position.x = Number(this.transformForm.controls["xLocation"].value);
      this.dirLight.position.y = Number(this.transformForm.controls["yLocation"].value);
      this.dirLight.position.z = Number(this.transformForm.controls["zLocation"].value);
      this.dirLight.specular = [Number(this.transformForm.controls["specular"].value), Number(this.transformForm.controls["specular"].value), Number(this.transformForm.controls["specular"].value)]
      this.dirLight.diffuse = [Number(this.transformForm.controls["diffuse"].value), Number(this.transformForm.controls["diffuse"].value), Number(this.transformForm.controls["diffuse"].value)]

    }
  }
}
