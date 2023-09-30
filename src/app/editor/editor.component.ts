import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';

import { Texture } from './class/Texture';
import { Mesh } from './class/Mesh';
import { OpenglService } from './service/opengl.service';
import { LoadFileService } from './service/load-file.service';
import { CameraService } from './service/camera.service';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MousePickingService } from './service/mouse-picking.service';
import { Shader } from './class/Shader';
import { GizmoService } from './service/gizmo.service';

import { SceneService } from './service/scene.service';
import { MeshType } from './interface/MeshInterface';
import { Grid } from './class/Grid';

interface IParam {
  internalformat: any,
  format: any,
  attachment?: any;
  minFilter: any,
  maxFilter: any,
  wrapS?: any,
  wrapT?: any,
  type: any
}

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
  shaderScene!: Shader;
  simpleDepthShader!: Shader;
  debugDepthQuad!: Shader;
  shaderGeometryPass!: Shader;
  shaderLightingPass!: Shader;
  @ViewChild('myCanvas', { static: true }) canvasRef!: ElementRef;

  width: any;
  fbo: any;
  fboTexture: any;
  quadVBO: any;

  depthMapFBO: any;

  gPosition: any;
  gNormal: any;
  gAlbedoSpec: any;
  gBuffer: any;
  depthMap: any;
  pixels: any;
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

    this.glService.gl?.bindFramebuffer(this.glService.gl?.FRAMEBUFFER, null);
    this.gizmoService.init();
    this.mousePickingService.init(this.gizmo);

    this.grid = new Grid(this.glService, this.loadFile);
    this.grid.init();
    this.shader = new Shader(this.glService.gl);
    this.shader && this.shader.init(
      await this.loadFile.getFile("/assets/shader.vs.glsl").toPromise(),
      await this.loadFile.getFile("/assets/shader.fs.glsl").toPromise()
    );

    this.shaderScene = new Shader(this.glService.gl);
    this.shaderScene && this.shaderScene.init(
      await this.loadFile.getFile("/assets/shader/shader-scene.vs.glsl").toPromise(),
      await this.loadFile.getFile("/assets/shader/shader-scene.fs.glsl").toPromise()
    );

    this.simpleDepthShader = new Shader(this.glService.gl);
    this.simpleDepthShader && this.simpleDepthShader.init(
      await this.loadFile.getFile("/assets/shader/shader-shadow-mapping-depth.vs.glsl").toPromise(),
      await this.loadFile.getFile("/assets/shader/shader-shadow-mapping-depth.fs.glsl").toPromise()
    );

    this.debugDepthQuad = new Shader(this.glService.gl);
    this.debugDepthQuad && this.debugDepthQuad.init(
      await this.loadFile.getFile("/assets/shader/debug_quad.vs.glsl").toPromise(),
      await this.loadFile.getFile("/assets/shader/debug_quad.fs.glsl").toPromise()
    );

    this.shaderGeometryPass = new Shader(this.glService.gl);
    this.shaderGeometryPass && this.shaderGeometryPass.init(
      await this.loadFile.getFile("/assets/shader/g_buffer.vs.glsl").toPromise(),
      await this.loadFile.getFile("/assets/shader/g_buffer.fs.glsl").toPromise()
    );
    this.shaderLightingPass = new Shader(this.glService.gl);
    this.shaderLightingPass && this.shaderLightingPass.init(
      await this.loadFile.getFile("/assets/shader/deferred_shading.vs.glsl").toPromise(),
      await this.loadFile.getFile("/assets/shader/deferred_shading.fs.glsl").toPromise()
    );


    this.glService.gl?.enable(this.glService.gl?.DEPTH_TEST);

    this.loadObject('assets/test43.glb', MeshType.Object);
    this.loadObject('assets/Light.glb', MeshType.Light);
    this.loadObject('assets/giz.glb', MeshType.Gizmo);
    this.randareBuffer();


    this.gBuffer = this.glService.gl.createFramebuffer();
    this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, this.gBuffer);
    this.gPosition = this.generateTexture({
      internalformat: this.glService.gl.RGBA16F,
      format: this.glService.gl.RGBA,
      type: this.glService.gl.FLOAT,
      minFilter: this.glService.gl.LINEAR,
      maxFilter: this.glService.gl.LINEAR,

    });
    this.glService.gl.framebufferTexture2D(this.glService.gl.FRAMEBUFFER, this.glService.gl.COLOR_ATTACHMENT0, this.glService.gl.TEXTURE_2D, this.gPosition, 0);

    this.gNormal = this.generateTexture({
      internalformat: this.glService.gl.RGBA16F,
      format: this.glService.gl.RGBA,
      type: this.glService.gl.FLOAT,
      minFilter: this.glService.gl.LINEAR,
      maxFilter: this.glService.gl.LINEAR
    })
    this.glService.gl.framebufferTexture2D(this.glService.gl.FRAMEBUFFER, this.glService.gl.COLOR_ATTACHMENT1, this.glService.gl.TEXTURE_2D, this.gNormal, 0);

    this.gAlbedoSpec = this.generateTexture({
      internalformat: this.glService.gl.RGBA,
      format: this.glService.gl.RGBA,
      type: this.glService.gl.UNSIGNED_BYTE,
      minFilter: this.glService.gl.LINEAR,
      maxFilter: this.glService.gl.LINEAR
    })
    this.glService.gl.framebufferTexture2D(this.glService.gl.FRAMEBUFFER, this.glService.gl.COLOR_ATTACHMENT2, this.glService.gl.TEXTURE_2D, this.gAlbedoSpec, 0);

    this.glService.gl.drawBuffers([
      this.glService.gl.COLOR_ATTACHMENT0,
      this.glService.gl.COLOR_ATTACHMENT1,
      this.glService.gl.COLOR_ATTACHMENT2,

    ]);

    const depthRenderbuffer = this.glService.gl.createRenderbuffer();
    this.glService.gl.bindRenderbuffer(this.glService.gl.RENDERBUFFER, depthRenderbuffer);
    this.glService.gl.renderbufferStorage(this.glService.gl.RENDERBUFFER, this.glService.gl.DEPTH_COMPONENT16, this.glService.canvas.width, this.glService.canvas.height);
    this.glService.gl.framebufferRenderbuffer(this.glService.gl.FRAMEBUFFER, this.glService.gl.DEPTH_ATTACHMENT, this.glService.gl.RENDERBUFFER, depthRenderbuffer);

    this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, null);


    this.depthMapFBO = this.generateBuffer();
    this.depthMap = this.generateTexture({
      internalformat: this.glService.gl.DEPTH_COMPONENT16,
      format: this.glService.gl.DEPTH_COMPONENT,
      type: this.glService.gl.UNSIGNED_SHORT,
      minFilter: this.glService.gl.NEAREST,
      maxFilter: this.glService.gl.NEAREST,
      wrapS: this.glService.gl.REPEAT,
      wrapT: this.glService.gl.REPEAT

    })
    this.glService.gl.framebufferTexture2D(this.glService.gl.FRAMEBUFFER, this.glService.gl.DEPTH_ATTACHMENT, this.glService.gl.TEXTURE_2D, this.depthMap, 0);



    // this.glService.gl.drawBuffers([]);
    // this.glService.gl.readBuffer(this.glService.gl.NONE);
    const framebufferStatus = this.glService.gl.checkFramebufferStatus(this.glService.gl.FRAMEBUFFER);
    if (framebufferStatus !== this.glService.gl.FRAMEBUFFER_COMPLETE) {
      console.error("Framebuffer is not complete");
    }
    this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, null);
  }

  glError() {
    const error = this.glService.gl.getError();
    if (error !== this.glService.gl.NO_ERROR) {
      console.log("WebGL error:", error);
    }
  }

  generateBuffer() {
    let buffer: any = this.glService.gl.createFramebuffer();
    this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, buffer);

    return buffer;
  }

  generateTexture(param: IParam) {
    let texture = this.glService.gl.createTexture();

    this.glService.gl.bindTexture(this.glService.gl.TEXTURE_2D, texture);
    this.glService.gl.texImage2D(this.glService.gl.TEXTURE_2D, 0, param.internalformat, this.glService.canvas.width, this.glService.canvas.height, 0, param.format, param.type, null);

    // this.glService.gl.texImage2D(this.glService.gl.TEXTURE_2D, 0, param.internalformat, this.glService.canvas.width, this.glService.canvas.height, 0, param.format, param.type, null);

    param.maxFilter && this.glService.gl.texParameteri(this.glService.gl.TEXTURE_2D, this.glService.gl.TEXTURE_MIN_FILTER, param.minFilter);
    param.minFilter && param.maxFilter && this.glService.gl.texParameteri(this.glService.gl.TEXTURE_2D, this.glService.gl.TEXTURE_MAG_FILTER, param.maxFilter);
    param.wrapS && this.glService.gl.texParameteri(this.glService.gl.TEXTURE_2D, this.glService.gl.TEXTURE_WRAP_S, param.wrapS);
    param.wrapT && this.glService.gl.texParameteri(this.glService.gl.TEXTURE_2D, this.glService.gl.TEXTURE_WRAP_T, param.wrapT);
    return texture;
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
    this.loadObject('assets/Light.glb', MeshType.Light);
  }


  randareBuffer() {

    let quadVertices: any[] = [
      -1.0, 1.0, 0.0, 1.0,
      -1.0, -1.0, 0.0, 0.0,
      1.0, -1.0, 1.0, 0.0,

      -1.0, 1.0, 0.0, 1.0,
      1.0, -1.0, 1.0, 0.0,
      1.0, 1.0, 1.0, 1.0
    ];
    this.quadVBO = this.glService.gl?.createBuffer();
    this.glService.gl?.bindBuffer(this.glService.gl.ARRAY_BUFFER, this.quadVBO);
    this.glService.gl?.bufferData(this.glService.gl.ARRAY_BUFFER, new Float32Array(quadVertices), this.glService.gl.STATIC_DRAW);
    this.glService.gl?.enableVertexAttribArray(0);
    this.glService.gl?.vertexAttribPointer(0, 2, this.glService.gl?.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
    this.glService.gl?.enableVertexAttribArray(1);
    this.glService.gl?.vertexAttribPointer(1, 2, this.glService.gl?.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);

    this.glService.gl?.disableVertexAttribArray(0);
    this.glService.gl?.disableVertexAttribArray(1);

  }

  render(): void {
    this.glService.gl.viewport(0, 0, this.glService.canvas.width, this.glService.canvas.height);
    this.glService.gl.cullFace(this.glService.gl.FRONT);
    this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, this.depthMapFBO);
    this.glService.gl?.enable(this.glService.gl?.DEPTH_TEST);

    this.glService.gl?.clearColor(0.22, 0.22, 0.22, 1);
    this.glService.gl?.clear(this.glService.gl.DEPTH_BUFFER_BIT);
    this.sceneService.getMeshs().forEach((_: any) => {
      _.renderForward(this.camera, { shader: this.simpleDepthShader }, true)
    });
    const pixelData = new Uint8Array(this.glService.canvas.width * this.glService.canvas.height * 4);
    this.glService.gl.readPixels(0, 0, this.glService.canvas.width, this.glService.canvas.height, this.glService.gl.RGBA, this.glService.gl.UNSIGNED_BYTE, pixelData);

    const framebufferStatus = this.glService.gl.checkFramebufferStatus(this.glService.gl.FRAMEBUFFER);
    if (framebufferStatus !== this.glService.gl.FRAMEBUFFER_COMPLETE) {
      console.error("Framebuffer is not complete");
    }
    this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, null);
    this.glService.gl.cullFace(this.glService.gl.BACK);


    this.glService.gl.viewport(0, 0, this.glService.canvas.width, this.glService.canvas.height);
    this.glService.gl?.enable(this.glService.gl?.DEPTH_TEST);
    this.glService.gl?.clearColor(0.2, 0.2, 0.2, 1);
    this.glService.gl?.clear(this.glService.gl.COLOR_BUFFER_BIT | this.glService.gl.DEPTH_BUFFER_BIT);

    this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, this.gBuffer);

    this.glService.gl?.clear(this.glService.gl.COLOR_BUFFER_BIT | this.glService.gl.DEPTH_BUFFER_BIT);
    this.sceneService.getMeshs().forEach((_: any) => {
      _.renderDeferred(this.camera, { shader: this.shaderGeometryPass })
    });

    this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, null);

    this.glService.gl?.clear(this.glService.gl.COLOR_BUFFER_BIT | this.glService.gl.DEPTH_BUFFER_BIT);

    if (this.shaderLightingPass && this.shaderLightingPass.program) {
      this.glService.gl?.useProgram(this.shaderLightingPass.program);
      this.glService.gl?.uniform1i(this.getUniformLocation(this.shaderLightingPass, 'gPosition'), 0);
      this.glService.gl?.uniform1i(this.getUniformLocation(this.shaderLightingPass, 'gNormal'), 1);
      this.glService.gl?.uniform1i(this.getUniformLocation(this.shaderLightingPass, 'gAlbedoSpec'), 2);
      this.glService.gl?.uniform1i(this.getUniformLocation(this.shaderLightingPass, 'shadowMap'), 3);

      this.glService.gl?.uniform1i(this.getUniformLocation(this.shaderLightingPass, 'nr_light'), 1);

      this.glService.gl?.uniform3f(this.getUniformLocation(this.shaderLightingPass, 'lights[0].Position'), 1, 4, 1);
      this.glService.gl?.uniform3f(this.getUniformLocation(this.shaderLightingPass, 'lights[0].Color'), 1, 1, 1);
      this.glService.gl?.uniform1f(this.getUniformLocation(this.shaderLightingPass, 'lights[0].Linear'), 0.14);
      this.glService.gl?.uniform1f(this.getUniformLocation(this.shaderLightingPass, 'lights[0].Quadratic'), 0.07);


      let m = this.sceneService.getMeshs()[0]?.lightSpaceMatrix;
      m && this.glService.gl?.uniformMatrix4fv(this.getUniformLocation(this.shaderLightingPass, 'lightSpaceMatrix'), this.glService.gl?.FALSE, m);
      this.glService.gl?.uniform3f(this.getUniformLocation(this.shaderLightingPass, 'viewPos'), this.camera.cameraPos[0], this.camera.cameraPos[1], this.camera.cameraPos[2]);
      this.renderDebugDepthQuad([this.gPosition, this.gNormal, this.gAlbedoSpec, this.depthMap]);
      this.sceneService.addDepthMap(this.depthMap);
    }
    this.renderScene();

    // if (this.debugDepthQuad && this.debugDepthQuad.program) {

    //   this.glService.gl?.useProgram(this.debugDepthQuad.program);
    //   this.glService.gl?.uniform1f(this.getUniformLocation(this.debugDepthQuad, 'depthMap'), 0);
    //   this.glService.gl?.uniform1f(this.getUniformLocation(this.debugDepthQuad, 'near_plane'), -20);
    //   this.glService.gl?.uniform1f(this.getUniformLocation(this.debugDepthQuad, 'far_plane'), 20);
    // }
    //this.renderDebugDepthQuad([this.depthMap]);
    //this.renderDebugDepthQuad([this.gNormal]);
    //this.renderDebugDepthQuad([this.gAlbedoSpec]);
    //this.renderDebugDepthQuad([this.gPosition]);
    requestAnimationFrame(() => this.render());
  }

  renderScene() {
    this.glService.gl.viewport(0, 0, this.glService.canvas.width, this.glService.canvas.height);
    //this.glService.gl?.enable(this.glService.gl.COLOR_BUFFER_BIT | this.glService.gl.DEPTH_BUFFER_BIT);

    // this.sceneService.getMeshs().forEach((_: any) => {
    //   _.renderForward(this.camera, { shader: this.shader }, false, this.depthMap)
    // });

    if (this.mousePickingService.meshSelected) {
      this.glService.gl?.clear(this.glService.gl.DEPTH_BUFFER_BIT);
      this.gizmo && this.gizmo.forEach(_ => {
        _.coordonate.position &&
          this.mousePickingService.meshSelected?.coordonate.position &&
          (_.coordonate.position = this.mousePickingService.meshSelected?.coordonate.position)
        _.renderForward(this.camera, { shader: this.shader })
      });
    }
  }

  renderDebugDepthQuad(texture: any[]) {

    this.glService.gl.activeTexture(this.glService.gl.TEXTURE0);
    this.glService.gl.bindTexture(this.glService.gl.TEXTURE_2D, texture[0]);

    this.glService.gl.activeTexture(this.glService.gl.TEXTURE1);
    this.glService.gl.bindTexture(this.glService.gl.TEXTURE_2D, texture[1]);

    this.glService.gl.activeTexture(this.glService.gl.TEXTURE2);
    this.glService.gl.bindTexture(this.glService.gl.TEXTURE_2D, texture[2]);

    this.glService.gl.activeTexture(this.glService.gl.TEXTURE3);
    this.glService.gl.bindTexture(this.glService.gl.TEXTURE_2D, texture[3]);
    this.glService.gl?.bindBuffer(this.glService.gl.ARRAY_BUFFER, this.quadVBO);
    this.glService.gl?.enableVertexAttribArray(0);
    this.glService.gl?.vertexAttribPointer(0, 2, this.glService.gl?.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
    this.glService.gl?.enableVertexAttribArray(1);
    this.glService.gl?.vertexAttribPointer(1, 2, this.glService.gl?.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);

    this.glService.gl?.drawArrays(this.glService.gl?.TRIANGLES, 0, 6);

    this.glService.gl?.disableVertexAttribArray(0);
    this.glService.gl?.disableVertexAttribArray(1);


  }

  private getUniformLocation(shader: Shader, uniformLocation: any) {
    return this.glService.gl?.getUniformLocation(shader.program, uniformLocation)
  }

}
