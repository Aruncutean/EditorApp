import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  canvas: any;
  gl: any;
  debugDepthQuad!: Shader;
  quadVBO: any;
  depthMap: any;
  constructor(private loadFile: LoadFileService,
    private sceneService: SceneService) {

  }

  ngOnInit(): void {
    this.sceneService.data$.subscribe(_ => {
      if (_.depthMap && this.gl) {
        let texture = this.gl.createTexture();

        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.DEPTH_COMPONENT16, this.canvas.width, this.canvas.height, 0, this.gl.DEPTH_COMPONENT, this.gl.UNSIGNED_SHORT, null);

        // this.glService.gl.texImage2D(this.glService.gl.TEXTURE_2D, 0, param.internalformat, this.glService.canvas.width, this.glService.canvas.height, 0, param.format, param.type, null);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, texture, 0);

      }
      _.depthMap && (this.depthMap = _.depthMap)
    })
  }

  ngAfterViewInit(): void {
    this.initWebGL();
    this.render();
  }

  async initWebGL() {
    this.canvas = this.canvasRef.nativeElement;
    this.gl = this.canvas.getContext('webgl2', { antialias: true });
    if (!this.gl) {
      console.error('ShadowMappingComponent Your browser does not support WebGL');
    }

    this.debugDepthQuad = new Shader(this.gl);
    this.debugDepthQuad && this.debugDepthQuad.init(
      await this.loadFile.getFile("/assets/shader/debug_quad.vs.glsl").toPromise(),
      await this.loadFile.getFile("/assets/shader/debug_quad.fs.glsl").toPromise()
    );
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
        this.gl?.uniform1f(this.getUniformLocation(this.debugDepthQuad, 'depthMap'), 0);
        this.gl?.uniform1f(this.getUniformLocation(this.debugDepthQuad, 'near_plane'), -100);
        this.gl?.uniform1f(this.getUniformLocation(this.debugDepthQuad, 'far_plane'), 200);


        if (this.depthMap) {

          this.gl.activeTexture(this.gl.TEXTURE0);
          this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthMap);
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
