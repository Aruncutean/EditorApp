import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';

import { ObjectPropComponent } from './object-prop/object-prop.component';
import { MaterialPropComponent } from './material-prop/material-prop.component';
import { ModifiersPropComponent } from './modifiers-prop/modifiers-prop.component';
import { LightPropComponent } from './light-prop/light-prop.component';
import { SceneService } from '../../service/scene.service';
import { Mesh } from '../../class/Mesh';
import { ShadowMappingComponent } from './shadow-mapping/shadow-mapping.component';

@Component({
  selector: 'app-editor-object',
  templateUrl: './editor-object.component.html',
  styleUrls: ['./editor-object.component.scss']
})
export class EditorObjectComponent implements OnInit, AfterViewInit, OnDestroy, AfterContentInit {

  @ViewChild('viewContainer', { read: ViewContainerRef }) viewContainerRef!: ViewContainerRef;

  @ViewChild('objectProp', { read: TemplateRef }) objectPropT!: TemplateRef<any>;
  factory: any;
  meshSelected!: Mesh;
  constructor(private resolver: ComponentFactoryResolver,
    private sceneService: SceneService,
    private cdRef: ChangeDetectorRef) {

  }
  ngAfterContentInit(): void {

  }

  ngOnInit(): void {
    this.factory = this.resolver.resolveComponentFactory(ObjectPropComponent);
    this.sceneService.data$.subscribe(_ => {

      // if (this.meshSelected != _.meshSelected) {
      //   let factory = this.resolver.resolveComponentFactory(ObjectPropComponent);
      //   this.viewContainerRef.clear();
      //   this.viewContainerRef.createComponent(factory);
      // }
    })


  }

  ngAfterViewInit(): void {
    //  this.cdRef && this.cdRef.detectChanges();
    this.viewContainerRef && this.viewContainerRef.clear();
    //this.viewContainerRef && this.viewContainerRef.createEmbeddedView(this.objectPropT)
    this.viewContainerRef.createComponent(this.factory);
    this.cdRef && this.cdRef.detectChanges();
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
      case "ShadowMapping":
        factory = this.resolver.resolveComponentFactory(ShadowMappingComponent);
        break;
      default:
        break;
    }

    this.viewContainerRef.clear();
    this.viewContainerRef.createComponent(factory);

  }

}
