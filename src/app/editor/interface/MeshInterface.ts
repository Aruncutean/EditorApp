import { Geometry } from "../class/Geometry";
import { CoordonateInerface } from "./CoordonateInterface";
import { MaterialInterface } from "./MaterialInterface";

export enum MeshType {
    Object = 0, Light = 1, Gizmo = 2
}

export interface MeshInterface {
    id: string;
    coordonate: CoordonateInerface;
    geometry: Geometry;
    material: MaterialInterface;
    name: string;
    type: MeshType;
    loadLight: boolean;
}