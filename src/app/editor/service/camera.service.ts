import { Injectable } from '@angular/core';
import { vec3 } from 'gl-matrix';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  cameraPos: vec3 = [7, 11, 13];
  cameraFront: vec3 = [0, 0, -1];
  cameraUp: vec3 = [0, 1, 0];
  fieldOfView: any = 20;
  constructor() {
  }

  precessInput(keys: { [key: string]: boolean }) {
    var cameraSpeed = 0.1;

    if (keys["w"]) {
      var v: vec3 = [0, 0, 0];
      vec3.multiply(v, this.cameraFront, [cameraSpeed, cameraSpeed, cameraSpeed]);
      vec3.add(this.cameraPos, this.cameraPos, v);
    }

    if (keys["s"]) {
      var v: vec3 = [0, 0, 0];
      vec3.multiply(v, this.cameraFront, [cameraSpeed, cameraSpeed, cameraSpeed]);
      vec3.sub(this.cameraPos, this.cameraPos, v);
    }

    if (keys["a"]) {
      var v: vec3 = [0, 0, 0];
      vec3.copy(v, this.cameraFront);
      vec3.cross(v, v, this.cameraUp);
      vec3.normalize(v, v);
      vec3.multiply(v, v, [cameraSpeed, cameraSpeed, cameraSpeed]);
      vec3.sub(this.cameraPos, this.cameraPos, v);
    }


    if (keys["d"]) {
      var v: vec3 = [0, 0, 0];
      vec3.copy(v, this.cameraFront);
      vec3.cross(v, v, this.cameraUp);
      vec3.normalize(v, v);
      vec3.multiply(v, v, [cameraSpeed, cameraSpeed, cameraSpeed]);
      vec3.add(this.cameraPos, this.cameraPos, v);
    }


  }


  moveRight() {
    var cameraSpeed = 1;
    var v: vec3 = [0, 0, 0];
    vec3.copy(v, this.cameraFront);
    vec3.cross(v, v, this.cameraUp);
    vec3.normalize(v, v);
    vec3.multiply(v, v, [cameraSpeed, cameraSpeed, cameraSpeed]);
    vec3.add(this.cameraPos, this.cameraPos, v);
  }

  moveLeft() {
    var cameraSpeed = 1;
    var v: vec3 = [0, 0, 0];
    vec3.copy(v, this.cameraFront);
    vec3.cross(v, v, this.cameraUp);
    vec3.normalize(v, v);
    vec3.multiply(v, v, [cameraSpeed, cameraSpeed, cameraSpeed]);
    vec3.sub(this.cameraPos, this.cameraPos, v);
  }

}
