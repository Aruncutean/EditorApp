import { vec3 } from "gl-matrix";
import { Mesh } from "../class/Mesh";
import { Position } from "./CoordonateInterface";

export enum LightType {
    direct = 0,
    spot = 1,
    point = 2,
}

export interface Light {
    id: string;
    type?: LightType;
    ambient?: vec3;
    diffuse?: vec3;
    specular?: vec3;
    constant?: number
    linear?: number;
    quadratic?: number;
    mesh?: Mesh;
    position?: Position
}
