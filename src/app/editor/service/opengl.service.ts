import { ElementRef, Injectable } from '@angular/core';
import { CameraService } from './camera.service';
import { glMatrix, vec3 } from 'gl-matrix';

@Injectable({
  providedIn: 'root'
})
export class OpenglService {

  gl: WebGLRenderingContext | any;

  yaw: number = 150;
  pitch: number = 40;

  lastX: number = 0;
  lastY: number = 0;

  xoffset: number = 0;
  yoffset: number = 0;
  isMousePressed: boolean = false;
  canvas!: HTMLCanvasElement;
  private keys: { [key: string]: boolean } = {};
  constructor(private camera: CameraService) { }


  init(canvasRef: ElementRef) {
    this.canvas = canvasRef.nativeElement;
    let radius = this.camera.fieldOfView;
    var direction: vec3 = [0, 0, 0];
    direction[0] = radius * Math.cos(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
    direction[1] = radius * Math.sin(glMatrix.toRadian(this.pitch))
    direction[2] = radius * Math.sin(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
    vec3.add(this.camera.cameraPos, direction, this.camera.cameraFront);
    window.addEventListener('keyup', (event) => {
      this.keys[event.key] = false;
      this.camera.precessInput(this.keys)
    });

    window.addEventListener('keydown', (event) => {
      this.keys[event.key] = true;
      this.camera.precessInput(this.keys)
    })

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
      let radius = this.camera.fieldOfView;
      var direction: vec3 = [0, 0, 0];
      direction[0] = radius * Math.cos(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
      direction[1] = radius * Math.sin(glMatrix.toRadian(this.pitch))
      direction[2] = radius * Math.sin(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
      vec3.add(this.camera.cameraPos, direction, this.camera.cameraFront);
      //vec3.normalize(this.camera.cameraFront, direction);

    })
    this.canvas.addEventListener("wheel", (event) => {
      const delta = event.deltaY;
      var sensitivity = 0.1;
      if (delta > 0) {
        // Zoom out

        this.camera.fieldOfView += 5.0 * sensitivity;
      } else {
        // Zoom in
        this.camera.fieldOfView -= 5.0 * sensitivity;
      }
      let radius = this.camera.fieldOfView;
      var direction: vec3 = [0, 0, 0];
      direction[0] = radius * Math.cos(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
      direction[1] = radius * Math.sin(glMatrix.toRadian(this.pitch))
      direction[2] = radius * Math.sin(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
      vec3.add(this.camera.cameraPos, direction, this.camera.cameraFront);
    });
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

}
