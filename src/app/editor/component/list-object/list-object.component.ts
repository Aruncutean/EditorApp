import { FlatTreeControl } from '@angular/cdk/tree';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { SceneService } from '../../service/scene.service';

import { MeshType } from '../../interface/MeshInterface';
import { MousePickingService } from '../../service/mouse-picking.service';
import { Scene } from '../../interface/SceneInterface';
import { Mesh } from '../../class/Mesh';


@Component({
  selector: 'app-list-object',
  templateUrl: './list-object.component.html',
  styleUrls: ['./list-object.component.scss']
})
export class ListObjectComponent implements OnInit, AfterViewInit {

  meshs: Mesh[] = [];
  meshSeleced!: any;
  
  meshTypeLight: MeshType = MeshType.Light;
  constructor(private sceneService: SceneService,
    private cdRef: ChangeDetectorRef,
    private mousePicking: MousePickingService) {

  }

  ngOnInit(): void {
    this.sceneService.data$.subscribe((_: Scene) => {
      this.meshs = _.meshs;
      this.meshSeleced = this.mousePicking.meshSelected;
      this.cdRef && this.cdRef.detectChanges();
    })
  }

  ngAfterViewInit(): void {

  }

  selectObj(mesh: any) {
    this.mousePicking.meshSelected = mesh;
    this.sceneService.setMeshSelected(this.mousePicking.meshSelected);
  }

}
