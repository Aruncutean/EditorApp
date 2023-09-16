import { Component, ElementRef, ViewChild } from '@angular/core';

import { Texture } from './class/Texture';
import { Mesh } from './class/Mesh';
import { OpenglService } from './service/opengl.service';
import { LoadFileService } from './service/load-file.service';
import { CameraService } from './service/camera.service';
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MousePickingService } from './service/mouse-picking.service';
import { delay } from 'rxjs';
import { Shader } from './class/Shader';
import { LightInterface } from './interface/LightInterface';
import { vec3 } from 'gl-matrix';
import { GizmoService } from './service/gizmo.service';
import { Position } from './interface/CoordonateInterface';
import { SceneService } from './service/scene.service';
@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent {
  positionAttribLocation: any;
  colorAttribLocation: any;
  program: any;

  gizmo: Mesh[] = [];
  lightMesh: LightInterface[] = [];
  textre!: Texture;
  loader: any;
  isOpen: boolean = false;
  shader!: Shader;
  @ViewChild('myCanvas', { static: true }) canvasRef!: ElementRef;


  lightPoz: Position = { x: 1, y: 2, z: 2 };
  value: string = "80px auto 30%";
  constructor(

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
    this.mousePickingService.init(this.sceneService.getMesh(), this.gizmo);
    this.shader = new Shader(this.glService);
    this.shader && this.shader.init(
      await this.loadFile.getFile("/assets/shader.vs.glsl").toPromise(),
      await this.loadFile.getFile("/assets/shader.fs.glsl").toPromise()
    );

    this.glService.gl?.enable(this.glService.gl?.DEPTH_TEST);
    this.glService.gl?.enable(this.glService.gl?.GL_MULTISAMPLE);

    this.loader = new GLTFLoader();
    this.loader && this.loader.load('assets/test2.glb', (gltf: { scene: any; }) => {
      const model = gltf.scene;

      model.children.map((_: any) => {
        let mesh!: Mesh;
        _.geometry?.attributes &&
          (mesh = new Mesh({
            vertices: _.geometry.attributes.position.array,
            normal: _.geometry.attributes.normal.array,
            uv: _.geometry.attributes.uv.array,
            indices: _.geometry.index.array
          },
            {
              texture: _.material.map ? new Texture("assets/" + _.material.map.name + ".png", this.glService) : undefined,
              color: _.material.color
            },
            {
              position: { x: _.position.x, y: _.position.y, z: _.position.z },
              rotation: _.rotation,
              scale: _.scale
            },
            this.glService
          ))
        mesh && (mesh.loadLight = true);
        mesh && this.sceneService.addMesh(mesh);

      })
    });


    this.loader && this.loader.load('assets/sphere.glb', (gltf: { scene: any; }) => {

      const model = gltf.scene;

      model.children.map((_: any) => {
        let mesh!: Mesh;
        _.geometry?.attributes &&
          (mesh = new Mesh({
            vertices: _.geometry.attributes.position.array,
            normal: _.geometry.attributes.normal.array,
            uv: _.geometry.attributes.uv.array,
            indices: _.geometry.index.array
          },
            {
              texture: _.material.map ? new Texture("assets/" + _.material.map.name + ".png", this.glService) : undefined,
              color: _.material.color
            },
            {
              position: { x: _.position.x, y: _.position.y, z: _.position.z },
              rotation: _.rotation,
              scale: _.scale
            },
            this.glService
          ))
        this.lightPoz = mesh.coordonate.position;
        mesh && (mesh.loadLight = false);
        mesh && this.sceneService.addMesh(mesh);

      })
    })


    this.loader && this.loader.load('assets/giz.glb', (gltf: { scene: any; }) => {

      const model = gltf.scene;
      console.log(model);

      model.children.map((_: any) => {
        let mesh!: Mesh;
        _.geometry?.attributes &&
          (mesh = new Mesh({
            vertices: _.geometry.attributes.position.array,
            normal: _.geometry.attributes.normal.array,
            uv: _.geometry.attributes.uv.array,
            indices: _.geometry.index.array
          },
            {
              texture: _.material.map ? new Texture("assets/" + _.material.map.name + ".png", this.glService) : undefined,
              color: _.material.color
            },
            {
              position: { x: _.position.x, y: _.position.y, z: _.position.z },
              rotation: _.rotation,
              scale: _.scale
            },
            this.glService
          ))

        mesh && (mesh.loadLight = false);
        mesh && (mesh.name = _.name);
        mesh && this.gizmo.push(mesh);

      })
    })
  }

  render(): void {
    this.glService.gl?.clearColor(0.75, 0.8, 0.8, 1.0);
    this.glService.gl?.clear(this.glService.gl.COLOR_BUFFER_BIT | this.glService.gl.DEPTH_BUFFER_BIT);

    this.sceneService.getMesh().forEach(_ => {
      _.render(this.camera, { shader: this.shader }, this.lightPoz)
    });

    // this.lightMesh && this.lightMesh.forEach(_ => {
    //   _.mesh && _.mesh.render(this.camera, { shader: this.shader }, [this.lightPoz[0], this.lightPoz[1], this.lightPoz[2]])
    // });

    if (this.mousePickingService.meshSelected) {
      this.glService.gl?.clear(this.glService.gl.DEPTH_BUFFER_BIT);
      this.gizmo && this.gizmo.forEach(_ => {
        _.coordonate.position &&
          this.mousePickingService.meshSelected?.coordonate.position &&
          (_.coordonate.position = this.mousePickingService.meshSelected?.coordonate.position)
        _.render(this.camera, { shader: this.shader }, this.lightPoz)
      });
    }
    requestAnimationFrame(() => this.render());
  }
}
