import { Component, ElementRef, ViewChild } from '@angular/core';

import { Texture } from './class/Texture';
import { Mesh } from './class/Mesh';
import { ShaderService } from './service/shader.service';
import { OpenglService } from './service/opengl.service';
import { LoadFileService } from './service/load-file.service';
import { CameraService } from './service/camera.service';
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent {
  positionAttribLocation: any;
  colorAttribLocation: any;
  program: any;
  meshs: Mesh[] = [];
  textre!: Texture;
  loader: any;
  isOpen: boolean = false;
  @ViewChild('myCanvas', { static: true }) canvasRef!: ElementRef;
  @ViewChild('test', { static: true }) testRef!: ElementRef;

  value: string = "80px auto 30%";
  constructor(
    private shaderService: ShaderService,
    private glService: OpenglService,
    private loadFile: LoadFileService,
    private camera: CameraService
  ) {

  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.testRef.nativeElement.clientWidth

    this.initWebGL();
    this.render();
  }

  async initWebGL() {
    this.canvasRef.nativeElement.width = 1200;//this.testRef.nativeElement.clientWidth;
    this.canvasRef.nativeElement.height = 600;//this.testRef.nativeElement.clienteight;
    this.glService.init(this.canvasRef);
    this.shaderService.init(
      await this.loadFile.getFile("/assets/shader.vs.glsl").toPromise(),
      await this.loadFile.getFile("/assets/shader.fs.glsl").toPromise()
    );

    this.glService.gl?.clearColor(0.75, 0.85, 0.8, 1.0);
    this.glService.gl?.clear(this.glService.gl.COLOR_BUFFER_BIT | this.glService.gl.DEPTH_BUFFER_BIT);

    this.glService.gl?.enable(this.glService.gl?.DEPTH_TEST);

    this.loader = new GLTFLoader();
    this.loader && this.loader.load('assets/test.glb', (gltf: { scene: any; }) => {
      const model = gltf.scene;

      model.children.map((_: any) => {
        console.log(_);
        let mesh!: Mesh;
        _.geometry?.attributes &&
          (mesh = new Mesh(_.geometry.attributes.position.array,
            _.geometry.attributes.normal.array,
            _.geometry.attributes.uv.array,
            _.geometry.index.array,
            this.glService,
            this.shaderService))
        mesh && this.meshs.push(mesh);
        mesh && (mesh.poz = _.position);
        this.textre = new Texture("assets/test.png", this.glService);
      })
    });
  }

  isOpenF(val: boolean) {
    this.isOpen = val;
    if (val == true) {
      this.value = "180px auto 30%"
    } else {
      this.value = "80px auto 30%"
    }
    this.canvasRef.nativeElement.width = 1200;
    this.canvasRef.nativeElement.height = 600;
  }

  render(): void {
    this.glService.gl?.clearColor(0.75, 0.8, 0.8, 1.0);
    this.glService.gl?.clear(this.glService.gl.COLOR_BUFFER_BIT | this.glService.gl.DEPTH_BUFFER_BIT);

    this.meshs && this.meshs.forEach(_ => {
      this.textre.renderTexture();
      _.render(this.camera)
    });

    requestAnimationFrame(() => this.render());
  }
}
