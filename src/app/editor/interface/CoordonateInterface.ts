import { vec3 } from "gl-matrix";
import { Euler } from "three";

export interface CoordonateInerface {
    position: Position,
    rotation: Position,
    scale: Position,
}

export interface Position {
    x: number,
    y: number,
    z: number
}