import { ElementRef, Injectable } from '@angular/core';
import { CameraService } from './camera.service';
import { glMatrix, vec3 } from 'gl-matrix';
import { IParam } from '../interface/SceneInterface';

@Injectable({
  providedIn: 'root'
})
export class OpenglService {

  gl: WebGLRenderingContext | any;

  yaw: number = -90;
  pitch: number = 0;

  lastX: number = 0;
  lastY: number = 0;

  xoffset: number = 0;
  yoffset: number = 0;
  isMousePressed: boolean = false;
  canvas!: HTMLCanvasElement;

  quadVBO: any;
  quadVAO: any
  private keys: { [key: string]: boolean } = {};
  constructor(private camera: CameraService) { }


  init(canvasRef: ElementRef) {
    let previousMouseX = 0;
    let previousMouseY = 0;
    let isDragging = false;
    this.canvas = canvasRef.nativeElement;
    let radius = this.camera.fieldOfView;
    // var direction: vec3 = [0, 0, 0];
    // direction[0] = radius * Math.cos(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
    // direction[1] = radius * Math.sin(glMatrix.toRadian(this.pitch))
    // direction[2] = radius * Math.sin(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
    // vec3.add(this.camera.cameraPos, direction, this.camera.cameraFront);

    window.addEventListener('keyup', (event) => {
      this.keys[event.key] = false;
      this.camera.precessInput(this.keys)
    });

    window.addEventListener('keydown', (event) => {
      this.keys[event.key] = true;

      this.camera.precessInput(this.keys)
    })

    this.canvas.addEventListener('mousedown', (event) => {
      if (event.button == 0) {
        isDragging = true;
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      isDragging = false;

    });

    this.canvas.addEventListener('mousemove', (event) => {

      const x: number = event.clientX - this.canvas.getBoundingClientRect().left;
      const y: number = event.clientY - this.canvas.getBoundingClientRect().top;

      this.xoffset = (x - this.lastX);
      this.yoffset = (y - this.lastY);

      this.lastX = x;
      this.lastY = y
      if (!this.isMousePressed) {
        return;
      }

      var sensitivity = 0.1;

      this.yoffset *= sensitivity;
      this.xoffset *= sensitivity;

      this.yaw += this.xoffset;
      this.pitch += this.yoffset

      if (this.pitch > 89.0) {
        this.pitch = 89.0;
      }
      if (this.pitch < -89.0) {
        this.pitch = -89.0;
      }
      if (!this.isMousePressed) {
        return;
      }
      // let radius = this.camera.fieldOfView;
      // var direction: vec3 = [0, 0, 0];
      // direction[0] = radius * Math.cos(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
      // direction[1] = radius * Math.sin(glMatrix.toRadian(this.pitch))
      // direction[2] = radius * Math.sin(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
      // vec3.add(this.camera.cameraPos, direction, this.camera.cameraFront);

      var direction: vec3 = [0, 0, 0];
      direction[0] = Math.cos(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
      direction[1] = Math.sin(glMatrix.toRadian(this.pitch))
      direction[2] = Math.sin(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))

      vec3.normalize(this.camera.cameraFront, direction);

    })
    // this.canvas.addEventListener("wheel", (event) => {
    //   const delta = event.deltaY;
    //   var sensitivity = 0.1;
    //   if (delta > 0) {
    //     // Zoom out

    //     this.camera.fieldOfView += 5.0 * sensitivity;
    //   } else {
    //     // Zoom in
    //     this.camera.fieldOfView -= 5.0 * sensitivity;
    //   }
    //   let radius = this.camera.fieldOfView;
    //   var direction: vec3 = [0, 0, 0];
    //   direction[0] = radius * Math.cos(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
    //   direction[1] = radius * Math.sin(glMatrix.toRadian(this.pitch))
    //   direction[2] = radius * Math.sin(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
    //   vec3.add(this.camera.cameraPos, direction, this.camera.cameraFront);
    // });
    this.canvas.addEventListener('mousedown', (event) => {
      if (event.button == 1) {
        this.isMousePressed = true;
      }
    })

    this.canvas.addEventListener('mouseup', (event) => {
      this.isMousePressed = false;
    })


    this.gl = this.canvas.getContext('webgl2', { antialias: true });
    const supportedExtensions = this.gl.getSupportedExtensions();
    console.log(supportedExtensions);

    if (!this.gl) {
      alert('Your browser does not support WebGL');
    }

    let ext = this.gl.getExtension('EXT_color_buffer_float');
    if (!ext) {
      console.error('EXT_color_buffer_float is not supported');

    }


  }


  generateBuffer() {
    let buffer: any = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, buffer);

    return buffer;
  }

  generateTexture(param: IParam) {
    let texture = this.gl.createTexture();

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, param.internalformat, this.canvas.width, this.canvas.height, 0, param.format, param.type, null);
    param.maxFilter && this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, param.minFilter);
    param.minFilter && param.maxFilter && this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, param.maxFilter);
    param.wrapS && this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, param.wrapS);
    param.wrapT && this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, param.wrapT);
    return texture;
  }

  glError() {
    const error = this.gl.getError();
    if (error !== this.gl.NO_ERROR) {
      console.log("WebGL error:", error);
    }
  }

  glClear() {
    this.gl?.clearColor(0.22, 0.22, 0.22, 1);
    this.gl?.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }


  activeTexture(index: number, texture: any) {
    this.gl.activeTexture(this.gl.TEXTURE0 + index);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
  }

  initQuadBuffer() {
    let quadVertices: any[] = [
      -1.0, 1.0, 0.0, 1.0,
      -1.0, -1.0, 0.0, 0.0,
      1.0, -1.0, 1.0, 0.0,

      -1.0, 1.0, 0.0, 1.0,
      1.0, -1.0, 1.0, 0.0,
      1.0, 1.0, 1.0, 1.0
    ];
    this.quadVAO = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.quadVAO);
    this.quadVBO = this.gl?.createBuffer();
    this.gl?.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVBO);
    this.gl?.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(quadVertices), this.gl.STATIC_DRAW);
    this.gl?.enableVertexAttribArray(0);
    this.gl?.vertexAttribPointer(0, 2, this.gl?.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl?.enableVertexAttribArray(1);
    this.gl?.vertexAttribPointer(1, 2, this.gl?.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
    this.gl.bindVertexArray(null);
  }

  renderDebugDepthQuad(texture: any[]) {
    this.gl.bindVertexArray(this.quadVAO);

    for (let index in texture) {
      this.activeTexture(Number(index), texture[index]);
    }
    this.gl?.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVBO);


    this.gl?.drawArrays(this.gl?.TRIANGLES, 0, 6);
    this.gl.bindVertexArray(null);

  }
}
