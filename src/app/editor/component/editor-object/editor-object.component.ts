import { AfterViewInit, Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';

import { ObjectPropComponent } from './object-prop/object-prop.component';
import { MaterialPropComponent } from './material-prop/material-prop.component';
import { ModifiersPropComponent } from './modifiers-prop/modifiers-prop.component';
import { LightPropComponent } from './light-prop/light-prop.component';
import { SceneService } from '../../service/scene.service';
import { Mesh } from '../../class/Mesh';

@Component({
  selector: 'app-editor-object',
  templateUrl: './editor-object.component.html',
  styleUrls: ['./editor-object.component.scss']
})
export class EditorObjectComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('viewContainer', { read: ViewContainerRef }) viewContainerRef!: ViewContainerRef;

  meshSelected!: Mesh;
  constructor(private resolver: ComponentFactoryResolver,
    private sceneService: SceneService) {

  }

  ngOnInit(): void {
    this.sceneService.data$.subscribe(_ => {

      // if (this.meshSelected != _.meshSelected) {
      //   let factory = this.resolver.resolveComponentFactory(ObjectPropComponent);
      //   this.viewContainerRef.clear();
      //   this.viewContainerRef.createComponent(factory);
      // }
    })
  }

  ngAfterViewInit(): void {
    const factory = this.resolver.resolveComponentFactory(ObjectPropComponent);
    this.viewContainerRef.clear();
    this.viewContainerRef.createComponent(factory);
  }

  ngOnDestroy(): void {

  }

  tabChange(event: any) {

    let factory: any = this.resolver.resolveComponentFactory(ObjectPropComponent);

    switch (event) {
      case "Object":
        factory = this.resolver.resolveComponentFactory(ObjectPropComponent);
        break;
      case "Light":
        factory = this.resolver.resolveComponentFactory(LightPropComponent);
        break;
      case "Material":
        factory = this.resolver.resolveComponentFactory(MaterialPropComponent);
        break;
      case "Modifiers":
        factory = this.resolver.resolveComponentFactory(ModifiersPropComponent);
        break;
      default:
        break;
    }

    this.viewContainerRef.clear();
    this.viewContainerRef.createComponent(factory);

  }

}
