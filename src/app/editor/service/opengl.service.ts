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

  private keys: { [key: string]: boolean } = {};
  constructor(private camera: CameraService) { }


  init(canvasRef: ElementRef) {
    const canvas: HTMLCanvasElement = canvasRef.nativeElement;

    window.addEventListener('keyup', (event) => {
      this.keys[event.key] = false;
      this.camera.precessInput(this.keys)
    });

    window.addEventListener('keydown', (event) => {
      this.keys[event.key] = true;
      this.camera.precessInput(this.keys)
    })

    window.addEventListener('mousemove', (event) => {
      const x: number = event.clientX - canvas.getBoundingClientRect().left;
      const y: number = event.clientY - canvas.getBoundingClientRect().top;

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

    window.addEventListener('mousedown', (event) => {
      this.isMousePressed = true;

    })

    window.addEventListener('mouseup', (event) => {
      this.isMousePressed = false;
    })


    this.gl = canvas.getContext('webgl');

    if (!this.gl) {
      console.log('WebGL not supported, falling back on experimental-webgl');
      this.gl && (this.gl = canvas.getContext('experimental-webgl'));
    }

    if (!this.gl) {
      alert('Your browser does not support WebGL');
    }
  }


  degrees_to_radians(degrees: number) {
    var pi = Math.PI;
    return degrees * (pi / 180);
  }

}
