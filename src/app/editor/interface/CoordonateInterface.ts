import { vec3 } from "gl-matrix";
import { Euler } from "three";

export interface CoordonateInerface {
    position: Position,
    rotation: Euler,
    scale: vec3,
}

export interface Position {
    x: number,
    y: number,
    z: number
}