import { Shader } from "../class/Shader";

export interface ShaderInterface {
    shader: Shader,
    isMousePicking?: boolean,
    indexMousePicking?: number,
    viewMatrix: any;
    projMatrix: any;
}