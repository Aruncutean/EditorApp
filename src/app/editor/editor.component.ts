import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';

import { Texture } from './class/Texture';
import { Mesh } from './class/Mesh';
import { OpenglService } from './service/opengl.service';
import { LoadFileService } from './service/load-file.service';
import { CameraService } from './service/camera.service';
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MousePickingService } from './service/mouse-picking.service';
import { debounceTime, delay, distinctUntilChanged, fromEvent, map, startWith } from 'rxjs';
import { Shader } from './class/Shader';

import { vec3 } from 'gl-matrix';
import { GizmoService } from './service/gizmo.service';
import { Position } from './interface/CoordonateInterface';
import { SceneService } from './service/scene.service';
import { MeshType } from './interface/MeshInterface';
import { Grid } from './class/Grid';
@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit {

  gizmo: Mesh[] = [];

  grid!: Grid;
  loader: any;

  shader!: Shader;
  @ViewChild('myCanvas', { static: true }) canvasRef!: ElementRef;

  width: any;

  constructor(
    private cdRef: ChangeDetectorRef,
    private glService: OpenglService,
    private loadFile: LoadFileService,
    private camera: CameraService,
    private mousePickingService: MousePickingService,
    private gizmoService: GizmoService,
    private sceneService: SceneService
  ) {

  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initWebGL();
    this.render();
  }

  async initWebGL() {
    this.canvasRef.nativeElement.width = 1200;
    this.canvasRef.nativeElement.height = 600;
    this.glService.init(this.canvasRef);
    this.gizmoService.init();
    this.mousePickingService.init(this.gizmo);

    this.grid = new Grid(this.glService, this.loadFile);
    this.grid.init();
    this.shader = new Shader(this.glService);
    this.shader && this.shader.init(
      await this.loadFile.getFile("/assets/shader.vs.glsl").toPromise(),
      await this.loadFile.getFile("/assets/shader.fs.glsl").toPromise()
    );

    this.glService.gl?.enable(this.glService.gl?.DEPTH_TEST);
    //  this.glService.gl?.enable(this.glService.gl?.GL_MULTISAMPLE);

    this.loadObject('assets/test43.glb', MeshType.Object);
    this.loadObject('assets/sphere.glb', MeshType.Light);
    this.loadObject('assets/giz.glb', MeshType.Gizmo);

  }


  loadObject(urlObject: string, type: MeshType) {
    this.loader = new GLTFLoader();
    this.loader && this.loader.load(urlObject, (gltf: { scene: any; }) => {
      const model = gltf.scene;
      console.log(model)
      model.children.map((_: any) => {
        let mesh!: Mesh;
        let t;
        _.material.map && _.material.map.userData &&
          (t = _.material.map.userData.mimeType.split('/'))

        if (t && t[1] == 'jpeg') {
          t[1] = 'jpg'
        }
        _.geometry?.attributes &&
          (mesh = new Mesh({
            vertices: _.geometry.attributes.position.array,
            normal: _.geometry.attributes.normal.array,
            uv: _.geometry.attributes.uv.array,
            indices: _.geometry.index.array
          },
            {
              texture: _.material.map ? new Texture("assets/" + _.material.map.name + "." + t[1], this.glService) : undefined,
              color: _.material.color
            },
            {
              position: { x: _.position.x, y: _.position.y + 0.14, z: _.position.z },
              rotation: _.rotation,
              scale: _.scale
            },
            this.glService,
            this.sceneService
          ))
        mesh && (mesh.loadLight = (MeshType.Object == type));
        mesh && (mesh.name = _.name);
        mesh && (mesh.type = type);
        mesh && (mesh.id = String(new Date().valueOf() + Math.random()));

        if (MeshType.Light == type) {
          mesh && this.sceneService.addLight(mesh);
        };

        (MeshType.Gizmo == type) && mesh && this.gizmo.push(mesh);

        if (MeshType.Object == type) {
          mesh && this.sceneService.addMesh(mesh);
        }
      })
    });
  }

  addLight() {
    this.loadObject('assets/sphere.glb', MeshType.Light);
  }

  render(): void {
    this.glService.gl?.clearColor(0.22, 0.22, 0.22, 1);
    this.glService.gl?.clear(this.glService.gl.COLOR_BUFFER_BIT | this.glService.gl.DEPTH_BUFFER_BIT);

    this.grid && this.grid.render(this.camera);
    this.sceneService.getMeshs().forEach((_: any) => {
      _.render(this.camera, { shader: this.shader })
    });

    if (this.mousePickingService.meshSelected) {
      this.glService.gl?.clear(this.glService.gl.DEPTH_BUFFER_BIT);
      this.gizmo && this.gizmo.forEach(_ => {
        _.coordonate.position &&
          this.mousePickingService.meshSelected?.coordonate.position &&
          (_.coordonate.position = this.mousePickingService.meshSelected?.coordonate.position)
        _.render(this.camera, { shader: this.shader })
      });
    }
    requestAnimationFrame(() => this.render());
  }
}
