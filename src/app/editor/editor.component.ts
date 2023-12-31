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
import { glMatrix, mat4, vec3 } from 'gl-matrix';
import { Scene } from './interface/SceneInterface';
import { LoadObjectService } from './service/load-object.service';
import * as CANNON from 'cannon';
import { CubeLine } from './class/CubeLine';
import { Line } from './class/Line';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit {

  private world: CANNON.World;

  grid!: Grid;
  loader: any;

  shader!: Shader;
  shaderScene!: Shader;
  simpleDepthShader!: Shader;
  debugDepthQuad!: Shader;
  shaderGeometryPass!: Shader;
  shaderLightingPass!: Shader;
  shaderCubLine!: Shader;
  @ViewChild('myCanvas', { static: true }) canvasRef!: ElementRef;

  width: any;
  fbo: any;
  fboTexture: any;


  depthMapFBO: any;

  gPosition: any;
  gNormal: any;
  gAlbedoSpec: any;
  gBuffer: any;
  depthMap: any;
  pixels: any;

  vao: any;
  /// Test
  bufferTest: any;
  textureTest: any;

  dirLight: any;

  performance: any = window.performance

  lastTimestamp = performance.now();
  frameCount = 0;
  cubLine!: CubeLine;
  gizmoType = 1;
  constructor(

    private glService: OpenglService,
    private loadFile: LoadFileService,
    private loadObject: LoadObjectService,
    private camera: CameraService,
    private mousePickingService: MousePickingService,
    private gizmoService: GizmoService,
    private sceneService: SceneService
  ) {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);

    // const groundShape = new CANNON.Plane();
    // const groundBody = new CANNON.Body({ mass: 0, shape: groundShape });

    // // Setează poziția planului la (0, 0, 0)
    // groundBody.position.set(0, 0, 0);

    // // Adaugă planul la lumea Cannon.js
    // this.world.addBody(groundBody);
  }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.initWebGL();

  }

  initWebGL() {
    this.canvasRef.nativeElement.width = 1200;
    this.canvasRef.nativeElement.height = 600;
    this.glService.init(this.canvasRef);

    this.glService.gl?.bindFramebuffer(this.glService.gl?.FRAMEBUFFER, null);
    this.gizmoService.init();
    this.mousePickingService.init(this.loadObject.gizmo, this.world);

    this.grid = new Grid(this.glService, this.loadFile);
    this.grid.init();
    this.shader = new Shader(this.glService.gl, this.loadFile);
    this.shader && this.shader.init("/assets/shader.vs.glsl", "/assets/shader.fs.glsl");

    this.shaderScene = new Shader(this.glService.gl, this.loadFile);
    this.shaderScene && this.shaderScene.init("/assets/shader/shader-scene.vs.glsl", "/assets/shader/shader-scene.fs.glsl");

    this.simpleDepthShader = new Shader(this.glService.gl, this.loadFile);
    this.simpleDepthShader && this.simpleDepthShader.init("/assets/shader/shader-shadow-mapping-depth.vs.glsl", "/assets/shader/shader-shadow-mapping-depth.fs.glsl");

    this.debugDepthQuad = new Shader(this.glService.gl, this.loadFile);
    this.debugDepthQuad && this.debugDepthQuad.init("/assets/shader/debug_quad.vs.glsl", "/assets/shader/debug_quad.fs.glsl");

    this.shaderGeometryPass = new Shader(this.glService.gl, this.loadFile);
    this.shaderGeometryPass && this.shaderGeometryPass.init("/assets/shader/g_buffer.vs.glsl", "/assets/shader/g_buffer.fs.glsl");

    this.shaderLightingPass = new Shader(this.glService.gl, this.loadFile);
    this.shaderLightingPass && this.shaderLightingPass.init("/assets/shader/deferred_shading.vs.glsl", "/assets/shader/deferred_shading.fs.glsl");

    this.shaderCubLine = new Shader(this.glService.gl, this.loadFile);
    this.shaderCubLine.init(
      "/assets/shader-picking.vs.glsl",
      "/assets/shader-picking.fs.glsl");
    this.glService.gl?.enable(this.glService.gl?.DEPTH_TEST);

    this.loadObject.loadObject('assets/test12.glb', MeshType.Object, this.world);
    this.loadObject.loadObject('assets/Light.glb', MeshType.Light);
    this.loadObject.loadObject('assets/giz2.glb', MeshType.Gizmo);

    this.sceneService.data$.subscribe((_: Scene) => {
      this.dirLight = _.dirLight;
    })


    this.glService.initQuadBuffer();


    this.gBuffer = this.glService.gl.createFramebuffer();
    this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, this.gBuffer);
    this.gPosition = this.glService.generateTexture({
      internalformat: this.glService.gl.RGBA16F,
      format: this.glService.gl.RGBA,
      type: this.glService.gl.FLOAT,
      minFilter: this.glService.gl.LINEAR,
      maxFilter: this.glService.gl.LINEAR,

    });
    this.glService.gl.framebufferTexture2D(this.glService.gl.FRAMEBUFFER, this.glService.gl.COLOR_ATTACHMENT0, this.glService.gl.TEXTURE_2D, this.gPosition, 0);

    this.gNormal = this.glService.generateTexture({
      internalformat: this.glService.gl.RGBA16F,
      format: this.glService.gl.RGBA,
      type: this.glService.gl.FLOAT,
      minFilter: this.glService.gl.LINEAR,
      maxFilter: this.glService.gl.LINEAR
    })
    this.glService.gl.framebufferTexture2D(this.glService.gl.FRAMEBUFFER, this.glService.gl.COLOR_ATTACHMENT1, this.glService.gl.TEXTURE_2D, this.gNormal, 0);

    this.gAlbedoSpec = this.glService.generateTexture({
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

    this.depthMapFBO = this.glService.generateBuffer();
    this.depthMap = this.glService.generateTexture({
      internalformat: this.glService.gl.DEPTH_COMPONENT16,
      format: this.glService.gl.DEPTH_COMPONENT,
      type: this.glService.gl.UNSIGNED_SHORT,
      minFilter: this.glService.gl.NEAREST,
      maxFilter: this.glService.gl.NEAREST,
      wrapS: this.glService.gl.REPEAT,
      wrapT: this.glService.gl.REPEAT

    })
    this.glService.gl.framebufferTexture2D(this.glService.gl.FRAMEBUFFER, this.glService.gl.DEPTH_ATTACHMENT, this.glService.gl.TEXTURE_2D, this.depthMap, 0);

    this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, null);

    this.bufferTest = this.glService.generateBuffer();
    this.textureTest = this.glService.generateTexture({
      internalformat: this.glService.gl.RGBA16F,
      format: this.glService.gl.RGBA,
      type: this.glService.gl.FLOAT,
      minFilter: this.glService.gl.NEAREST,
      maxFilter: this.glService.gl.NEAREST,

    });
    this.glService.gl.framebufferTexture2D(this.glService.gl.FRAMEBUFFER, this.glService.gl.COLOR_ATTACHMENT0, this.glService.gl.TEXTURE_2D, this.textureTest, 0);

    this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, null);
    this.render();
  }

  addLight() {
    this.loadObject.loadObject('assets/Light.glb', MeshType.Light);
  }

  addMesh(type: any) {
    switch (type) {
      case "Cub":
        this.loadObject.loadObject('assets/mesh/cub.glb', MeshType.Object, this.world);
        break;
      case "UVSphere":
        this.loadObject.loadObject('assets/mesh/Sphere.glb', MeshType.Object, this.world);
        break;
      case "Plane":
        this.loadObject.loadObject('assets/mesh/plane.glb', MeshType.Object, this.world);
        break;
      default:
        break;
    }
  }

  changeGiz(type: any) {
    switch (type) {
      case "1":
        this.gizmoType = 1;
        this.mousePickingService.setGizmoType(1);
        break
      case "2":
        this.gizmoType = 2;
        this.mousePickingService.setGizmoType(2);
        break
      case "3":
        this.gizmoType = 3;
        this.mousePickingService.setGizmoType(3);
        break;
      case "4":
        this.gizmoType = 4;
        this.mousePickingService.setGizmoType(4);
        break
      default:
        break;
    }
  }

  renderFrameBuffer(buffer: any, interiorCode: Function) {
    this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, buffer);
    this.glService.glClear();
    interiorCode();
    this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, null);
  }

  calculareFPS() {
    var currentTimestamp = performance.now();
    var elapsedMilliseconds = currentTimestamp - this.lastTimestamp;

    if (elapsedMilliseconds >= 1000) {
      var fps = this.frameCount / (elapsedMilliseconds / 1000);
      //  console.log('FPS: ' + fps.toFixed(2));


      this.lastTimestamp = currentTimestamp;
      this.frameCount = 0;
    }

    this.frameCount++;
  }

  randareDepthMap(projMatrix: any, viewMatrix: any, lightSpaceMatrix: any) {

    this.glService.gl.viewport(0, 0, this.glService.canvas.width, this.glService.canvas.height);
    this.glService.gl.cullFace(this.glService.gl.FRONT);
    this.renderFrameBuffer(this.depthMapFBO, () => {
      mat4.ortho(projMatrix, -30.0, 30.0, -30.0, 30.0, -20.0, 20)
      if (this.dirLight) {
        this.dirLight.position && mat4.lookAt(viewMatrix, [-this.dirLight.position?.x, -this.dirLight.position?.y, -this.dirLight.position?.z], this.camera.cameraFront, this.camera.cameraUp);
      } else {
        mat4.lookAt(viewMatrix, [-2, -2, -2], this.camera.cameraFront, this.camera.cameraUp);
      }
      mat4.mul(lightSpaceMatrix, projMatrix, viewMatrix);
      this.sceneService.getMeshs().forEach((_: any) => {
        _.renderForward(this.camera, { shader: this.simpleDepthShader, viewMatrix: viewMatrix, projMatrix: projMatrix })
      });
    });
    this.glService.gl.cullFace(this.glService.gl.BACK);
  }

  randareTextureDepthMap() {
    this.renderFrameBuffer(this.bufferTest, () => {
      if (this.debugDepthQuad && this.debugDepthQuad.program) {
        this.debugDepthQuad.useShader();
        this.debugDepthQuad.sendInt('depthMap', 0);
        this.glService.renderDebugDepthQuad([this.depthMap]);
      }

      if (this.textureTest) {
        this.pixels = new Float32Array(this.glService.canvas.width * this.glService.canvas.height * 4);
        this.glService.gl.readPixels(0, 0, this.glService.canvas.width, this.glService.canvas.height, this.glService.gl.RGBA, this.glService.gl.FLOAT, this.pixels);
      }
    })
    this.sceneService.addDepthMap(this.pixels);
  }

  randareGBuffer(projMatrix: any, viewMatrix: any) {
    this.renderFrameBuffer(this.gBuffer, () => {
      this.sceneService.getMeshs().forEach((_: any) => {
        _.renderDeferred(this.camera, { shader: this.shaderGeometryPass, viewMatrix: viewMatrix, projMatrix: projMatrix })

      });
    });

  }

  render(): void {
    this.world.step(1 / 60);
    this.glService.glClear();
    let viewMatrix = new Float32Array(16);
    let projMatrix = new Float32Array(16);
    let lightSpaceMatrix = new Float32Array(16);

    this.calculareFPS();
    this.randareDepthMap(projMatrix, viewMatrix, lightSpaceMatrix);

    //this.randareTextureDepthMap();

    mat4.perspective(projMatrix, glMatrix.toRadian(45), this.glService.canvas.clientWidth / this.glService.canvas.clientHeight, 0.1, 100.0);

    const vec: vec3 = vec3.create()

    vec3.add(vec, this.camera.cameraPos, this.camera.cameraFront)
    mat4.lookAt(viewMatrix, this.camera.cameraPos, vec, this.camera.cameraUp);

    this.gizmoService.setMatrix(projMatrix, viewMatrix);
    this.mousePickingService.setMatrix(projMatrix, viewMatrix);
    this.randareGBuffer(projMatrix, viewMatrix);

    this.renderScene({ viewMatrix: viewMatrix, projMatrix: projMatrix, lightSpaceMatrix: lightSpaceMatrix });


    requestAnimationFrame(() => this.render());
  }


  renderScene(matrix: {
    viewMatrix: any;
    projMatrix: any;
    lightSpaceMatrix: any
  }) {
    this.glService.glClear()

    // if (this.shaderLightingPass && this.shaderLightingPass.program) {
    //   this.shaderLightingPass.useShader();

    //   this.shaderLightingPass.sendInt('gPosition', 0);
    //   this.shaderLightingPass.sendInt('gNormal', 1);
    //   this.shaderLightingPass.sendInt('gAlbedoSpec', 2);
    //   this.shaderLightingPass.sendInt('shadowMap', 3);

    //   this.shaderLightingPass.sendInt('nr_light', 3);

    //   this.shaderLightingPass.sendVec3N('lights[0].Position', [1, 4, 1]);
    //   this.shaderLightingPass.sendVec3N('lights[0].Color', [1, 1, 1]);
    //   this.shaderLightingPass.sendFloat('lights[0].Linear', 0.14);
    //   this.shaderLightingPass.sendFloat('lights[0].Quadratic', 0.07);



    //   this.shaderLightingPass.sendVec3N('lights[1].Position', [1, 4, 4]);
    //   this.shaderLightingPass.sendVec3N('lights[1].Color', [1, 1, 1]);
    //   this.shaderLightingPass.sendFloat('lights[1].Linear', 0.14);
    //   this.shaderLightingPass.sendFloat('lights[1].Quadratic', 0.07);

    //   this.shaderLightingPass.sendVec3N('lights[2].Position', [4, 4, 1]);
    //   this.shaderLightingPass.sendVec3N('lights[2].Color', [1, 1, 1]);
    //   this.shaderLightingPass.sendFloat('lights[2].Linear', 0.14);
    //   this.shaderLightingPass.sendFloat('lights[2].Quadratic', 0.07);

    //   matrix.lightSpaceMatrix && this.shaderLightingPass.setMat4('lightSpaceMatrix', matrix.lightSpaceMatrix);
    //   this.shaderLightingPass.sendVec3V('viewPos', this.camera.cameraPos);

    //   this.glService.renderDebugDepthQuad([this.gPosition, this.gNormal, this.gAlbedoSpec, this.depthMap]);
    // }

    this.glService.gl?.clear(this.glService.gl.DEPTH_BUFFER_BIT);
    // this.sceneService.getMeshs().forEach((_: any) => {
    //   this.cubLine = new CubeLine(this.glService, _.geometry);
    //   this.cubLine.render(this.shaderCubLine, _, matrix.viewMatrix, matrix.projMatrix);
    // });


    this.sceneService.getMeshs().forEach((_: any) => {
      _.renderForward(this.camera, { shader: this.shader, viewMatrix: matrix.viewMatrix, projMatrix: matrix.projMatrix }, this.depthMap, matrix.lightSpaceMatrix)
    });

    if (this.mousePickingService.meshSelected && this.gizmoType == 2) {
      this.glService.gl?.clear(this.glService.gl.DEPTH_BUFFER_BIT);
      this.loadObject.gizmo && this.loadObject.gizmo.forEach((_, index) => {
        let coordonate: { x: any, y: any, z: any } = { x: 0, y: 0, z: 0 }
        if (_.coordonate.position &&
          this.mousePickingService.meshSelected?.coordonate.position) {

          coordonate.x = this.mousePickingService.meshSelected?.coordonate.position.x + _.coordonate.position.x;
          coordonate.y = this.mousePickingService.meshSelected?.coordonate.position.y + _.coordonate.position.y;
          coordonate.z = this.mousePickingService.meshSelected?.coordonate.position.z + _.coordonate.position.z;

        }

        _.renderForward(this.camera, { shader: this.shader, viewMatrix: matrix.viewMatrix, projMatrix: matrix.projMatrix, coordonate: coordonate })
        // this.cubLine = new CubeLine(this.glService, _.geometry);
        // this.cubLine.render(this.shaderCubLine, _, matrix.viewMatrix, matrix.projMatrix, coordonate);
      });
    }
  }


  saveTexture() {

    // Crearea unui canvas pentru imagine
    const canvas = document.createElement("canvas");
    canvas.width = this.glService.canvas.width;
    canvas.height = this.glService.canvas.height;
    const ctx = canvas.getContext("2d");

    // Desenarea datelor de adâncime pe canvas
    if (ctx) {
      const imageData = ctx.createImageData(this.glService.canvas.width, this.glService.canvas.height);

      for (let i = 0; i < this.pixels.length; i++) {
        imageData.data[i] = Math.floor(this.pixels[i] * 255); // Convert to 8-bit value
      }
      ctx.putImageData(imageData, 0, 0);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "depth_map.png";
      link.click();
    }



  }
}
