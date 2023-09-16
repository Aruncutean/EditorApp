import { ElementRef, Injectable } from '@angular/core';
import { CameraService } from './camera.service';
import { glMatrix, vec3 } from 'gl-matrix';

@Injectable({
  providedIn: 'root'
})
export class OpenglService {

  gl: WebGLRenderingContext | any;

  yaw: number = 90;
  pitch: number = 0;

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

      var direction: vec3 = [0, 0, 0];
      direction[0] = Math.cos(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
      direction[1] = Math.sin(glMatrix.toRadian(this.pitch))
      direction[2] = - Math.sin(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch))
      vec3.normalize(this.camera.cameraFront, direction);

    })

    this.canvas.addEventListener('mousedown', (event) => {
      if (event.button == 1) {
        this.isMousePressed = true;
      }
    })

    this.canvas.addEventListener('mouseup', (event) => {
      this.isMousePressed = false;
    })


    this.gl = this.canvas.getContext('webgl2');

    if (!this.gl) {
      console.log('WebGL not supported, falling back on experimental-webgl');
      this.gl && (this.gl = this.canvas.getContext('experimental-webgl'));
    }

    if (!this.gl) {
      alert('Your browser does not support WebGL');
    }
  }

}
