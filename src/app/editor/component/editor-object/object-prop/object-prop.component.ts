import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Mesh } from 'src/app/editor/class/Mesh';
import { MousePickingService } from 'src/app/editor/service/mouse-picking.service';
import { SceneService } from 'src/app/editor/service/scene.service';


@Component({
  selector: 'app-object-prop',
  templateUrl: './object-prop.component.html',
  styleUrls: ['./object-prop.component.scss']
})
export class ObjectPropComponent implements OnInit, AfterViewInit {


  transformForm = new FormGroup({
    xLocation: new FormControl(0),
    yLocation: new FormControl(0),
    zLocation: new FormControl(0),
    xRotation: new FormControl(0),
    yRotation: new FormControl(0),
    zRotation: new FormControl(0),
    xScale: new FormControl(0),
    yScale: new FormControl(0),
    zScale: new FormControl(0),
  });

  constructor(private mousePicker: MousePickingService,
    private sceneService: SceneService,
    private cdr: ChangeDetectorRef) { }


  ngOnInit(): void {
 
  }

  setValue() {
    this.mousePicker.meshSelected && this.transformForm.setValue({
      xLocation: Number(this.mousePicker.meshSelected.coordonate.position.x.toFixed(2)),
      yLocation: Number(this.mousePicker.meshSelected.coordonate.position.y.toFixed(2)),
      zLocation: Number(this.mousePicker.meshSelected.coordonate.position.z.toFixed(2)),
      xRotation: 0,
      yRotation: 0,
      zRotation: 0,
      xScale: 0,
      yScale: 0,
      zScale: 0
    })
   // this.cdr && this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    this.setValue()

    this.sceneService.data$.subscribe((_: any) => {
      this.setValue();
    })
  }

  valueChange() {
    if (this.mousePicker.meshSelected) {
      this.mousePicker.meshSelected.coordonate.position.x = Number(this.transformForm.controls["xLocation"].value);
      this.mousePicker.meshSelected.coordonate.position.y = Number(this.transformForm.controls["yLocation"].value);
      this.mousePicker.meshSelected.coordonate.position.z = Number(this.transformForm.controls["zLocation"].value);
    }
  }
}
