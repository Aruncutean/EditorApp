import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, numberAttribute } from '@angular/core';
import { Shader } from 'src/app/editor/class/Shader';
import { LoadFileService } from 'src/app/editor/service/load-file.service';
import { SceneService } from 'src/app/editor/service/scene.service';

@Component({
  selector: 'app-shadow-mapping',
  templateUrl: './shadow-mapping.component.html',
  styleUrls: ['./shadow-mapping.component.scss']
})
export class ShadowMappingComponent implements OnInit, AfterViewInit {


  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef;
  gl: any;
  debugDepthQuad!: Shader;
  quadVBO: any;
  depthMap: any;
  constructor(private loadFile: LoadFileService,
    private sceneService: SceneService) {

  }

  ngOnInit(): void {
    this.sceneService.data$.subscribe(_ => {
      _.depthMap && (this.depthMap = _.depthMap)
    })
  }

  ngAfterViewInit(): void {
    this.initWebGL();
    this.render();
  }

  async initWebGL() {
    let canvas = this.canvasRef.nativeElement;
    this.gl = canvas.getContext('webgl2', { antialias: true });
    if (!this.gl) {
      console.error('ShadowMappingComponent Your browser does not support WebGL');
    }

    this.debugDepthQuad = new Shader(this.gl, this.loadFile);
    this.debugDepthQuad && this.debugDepthQuad.init("/assets/shader/debug_quad.vs.glsl", "/assets/shader/debug_quad.fs.glsl");
    this.gl?.clearColor(0.2, 0.2, 0.2, 1);
    this.gl?.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    let quadVertices: any[] = [
      -1.0, 1.0, 0.0, 1.0,
      -1.0, -1.0, 0.0, 0.0,
      1.0, -1.0, 1.0, 0.0,

      -1.0, 1.0, 0.0, 1.0,
      1.0, -1.0, 1.0, 0.0,
      1.0, 1.0, 1.0, 1.0
    ];
    this.quadVBO = this.gl?.createBuffer();
    this.gl?.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVBO);
    this.gl?.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(quadVertices), this.gl.STATIC_DRAW);
    this.gl?.enableVertexAttribArray(0);
    this.gl?.vertexAttribPointer(0, 2, this.gl?.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl?.enableVertexAttribArray(1);
    this.gl?.vertexAttribPointer(1, 2, this.gl?.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);

    this.gl?.disableVertexAttribArray(0);
    this.gl?.disableVertexAttribArray(1);
  }

  render(): void {
    if (this.gl) {
      this.gl?.clearColor(0.5, 0.5, 0.5, 1);
      this.gl?.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

      if (this.debugDepthQuad && this.debugDepthQuad.program) {

        this.gl?.useProgram(this.debugDepthQuad.program);
        this.gl?.uniform1i(this.getUniformLocation(this.debugDepthQuad, 'depthMap'), 0);


        let depthMap = this.sceneService.getDepthMap();
        if (depthMap) {
          const framebuffer = this.gl.createFramebuffer()
          this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);

          const newTexture = this.gl.createTexture();
          this.gl.bindTexture(this.gl.TEXTURE_2D, newTexture);
          this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA16F, 400, 400, 0, this.gl.RGBA, this.gl.FLOAT, depthMap);

          //this.gl.generateMipmap(this.gl.TEXTURE_2D);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.MIRRORED_REPEAT);
          this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.MIRRORED_REPEAT);

          this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

          this.gl.activeTexture(this.gl.TEXTURE0);
          this.gl.bindTexture(this.gl.TEXTURE_2D, newTexture);
        }

        this.gl?.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVBO);
        this.gl?.enableVertexAttribArray(0);
        this.gl?.vertexAttribPointer(0, 2, this.gl?.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.gl?.enableVertexAttribArray(1);
        this.gl?.vertexAttribPointer(1, 2, this.gl?.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);

        this.gl?.drawArrays(this.gl?.TRIANGLES, 0, 6);

        this.gl?.disableVertexAttribArray(0);
        this.gl?.disableVertexAttribArray(1);
      }
    }
    requestAnimationFrame(() => this.render());
  }


  private getUniformLocation(shader: Shader, uniformLocation: any) {
    return this.gl?.getUniformLocation(shader.program, uniformLocation)
  }

}
