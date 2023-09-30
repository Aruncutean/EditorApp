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
      internalformat: this.glService.gl.RGBA32F,
      format: this.glService.gl.RGBA,
      type: this.glService.gl.FLOAT,
      minFilter: this.glService.gl.NEAREST,
      maxFilter: this.glService.gl.NEAREST,

    });
    this.glService.gl.framebufferTexture2D(this.glService.gl.FRAMEBUFFER, this.glService.gl.COLOR_ATTACHMENT0, this.glService.gl.TEXTURE_2D, this.textureTest, 0);

    this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, null);

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

  render(): void {
    {
      this.glService.gl.viewport(0, 0, this.glService.canvas.width, this.glService.canvas.height);
      this.glService.gl.cullFace(this.glService.gl.FRONT);
      this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, this.depthMapFBO);

      this.glService.glClear();

      this.sceneService.getMeshs().forEach((_: any) => {
        _.renderForward(this.camera, { shader: this.simpleDepthShader }, true)
      });

      this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, null);
      this.glService.gl.cullFace(this.glService.gl.BACK);
    }

    {
      this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, this.bufferTest);
      if (this.debugDepthQuad && this.debugDepthQuad.program) {
        this.debugDepthQuad.useShader();
        this.debugDepthQuad.sendInt('depthMap', 0);
        this.glService.renderDebugDepthQuad([this.depthMap]);
      }

      if (this.textureTest) {
        this.pixels = new Float32Array(this.glService.canvas.width * this.glService.canvas.height * 4);
        this.glService.gl.readPixels(0, 0, this.glService.canvas.width, this.glService.canvas.height, this.glService.gl.RGBA, this.glService.gl.FLOAT, this.pixels);
      }
      this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, null);
    }

    {

      this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, this.gBuffer);
      this.glService.glClear();
      this.sceneService.getMeshs().forEach((_: any) => {
        _.renderDeferred(this.camera, { shader: this.shaderGeometryPass })
      });

      this.glService.gl.bindFramebuffer(this.glService.gl.FRAMEBUFFER, null);
    }


    this.glService.glClear()
    if (this.shaderLightingPass && this.shaderLightingPass.program) {
      this.shaderLightingPass.useShader();

      this.shaderLightingPass.sendInt('gPosition', 0);
      this.shaderLightingPass.sendInt('gNormal', 1);
      this.shaderLightingPass.sendInt('gAlbedoSpec', 2);
      this.shaderLightingPass.sendInt('shadowMap', 3);

      this.shaderLightingPass.sendInt('nr_light', 1);

      this.shaderLightingPass.sendVec3N('lights[0].Position', [1, 4, 1]);
      this.shaderLightingPass.sendVec3N('lights[0].Color', [1, 1, 1]);
      this.shaderLightingPass.sendFloat('lights[0].Linear', 0.14);
      this.shaderLightingPass.sendFloat('lights[0].Quadratic', 0.07);

      let lightSpaceMatrix = this.sceneService.getMeshs()[0]?.lightSpaceMatrix;
      lightSpaceMatrix && this.shaderLightingPass.setMat4('lightSpaceMatrix', lightSpaceMatrix);
      this.shaderLightingPass.sendVec3V('viewPos', this.camera.cameraPos);

      this.glService.renderDebugDepthQuad([this.gPosition, this.gNormal, this.gAlbedoSpec, this.depthMap]);

    }
    this.renderScene();

    this.sceneService.addDepthMap(this.pixels);

    requestAnimationFrame(() => this.render());
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

  renderScene() {

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
}
