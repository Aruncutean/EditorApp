import { glMatrix, mat4, vec3 } from "gl-matrix";
import { OpenglService } from "../service/opengl.service";
import { CameraService } from "../service/camera.service";
import { Geometry, GeometryInterface } from "./Geometry";
import { ShaderInterface } from "../interface/ShaderInterface";
import { Texture, } from "./Texture";
import { CoordonateInerface, Position } from "../interface/CoordonateInterface";
import { MaterialInterface } from "../interface/MaterialInterface";
import { Shader } from "./Shader";
import { LightProcessing } from "./LightProcessing";
import { MeshInterface, MeshType } from "../interface/MeshInterface";
import { SceneService } from "../service/scene.service";

export class Mesh implements MeshInterface {
    id!: string;
    coordonate!: CoordonateInerface;
    geometry!: Geometry;
    material!: MaterialInterface;
    name!: string;
    loadLight!: boolean;
    type!: MeshType;
    private lightProcessing!: LightProcessing;
    constructor(geometrySource: GeometryInterface,
        material: MaterialInterface,
        coordonate: CoordonateInerface,
        private glService: OpenglService,
        private sceneService: SceneService
    ) {
        this.material = material;
        this.coordonate = coordonate;
        this.geometry = new Geometry(geometrySource, glService);
        this.lightProcessing = new LightProcessing(glService, sceneService)
    }

    render(camera: CameraService, shaderI: ShaderInterface) {
        this.glService.gl?.useProgram(shaderI.shader.program);

        if (shaderI.isMousePicking == true && shaderI.indexMousePicking) {
            const pickingColorOut = this.glService.gl?.getUniformLocation(shaderI.shader.program, 'PickingColor');
            const vec: any[] = [
                ((shaderI.indexMousePicking >> 0) & 0xFF) / 0xFF,
                ((shaderI.indexMousePicking >> 8) & 0xFF) / 0xFF,
                ((shaderI.indexMousePicking >> 16) & 0xFF) / 0xFF,
                ((shaderI.indexMousePicking >> 24) & 0xFF) / 0xFF]
            pickingColorOut && this.glService.gl.uniform4fv(pickingColorOut, vec);
        }
        else {
            this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, 'viewPos'), camera.cameraPos[0], camera.cameraPos[1], camera.cameraPos[2]);

            if (this.material.texture) {
                this.glService.gl?.uniform1f(this.getUniformLocation(shaderI.shader, 'isTexture'), 0);
                this.material.texture.renderTexture();
                this.lightProcessing.processing(shaderI);

                this.glService.gl?.uniform1i(this.getUniformLocation(shaderI.shader, 'material.diffuse'), 0.5);
                this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, 'material.specular'), 0.5, 0.5, 0.5);
                this.glService.gl?.uniform1f(this.getUniformLocation(shaderI.shader, 'material.shininess'), 32.0);

            } else {
                this.glService.gl?.uniform1f(this.getUniformLocation(shaderI.shader, 'isTexture'), 1);
                this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, 'objectColor'), this.material.color.r, this.material.color.g, this.material.color.b);
                if (this.loadLight == true) {
                    this.glService.gl?.uniform1f(this.getUniformLocation(shaderI.shader, 'loadLight'), 1);
                    this.lightProcessing.processing(shaderI);
                } else {
                    this.glService.gl?.uniform1i(this.getUniformLocation(shaderI.shader, 'loadLight'), 0);
                }

            }

        }

        let worldMatrix = new Float32Array(16);
        let viewMatrix = new Float32Array(16);
        let projMatrix = new Float32Array(16);

        // Position Object
        mat4.identity(worldMatrix);
        let poz: any = this.coordonate.position;

        poz.x !== undefined ? mat4.translate(worldMatrix, worldMatrix, [poz.x, poz.y, poz.z]) :
            mat4.translate(worldMatrix, worldMatrix, [poz[0], poz[1], poz[2]])
        let scale: any = this.coordonate.scale;
        mat4.scale(worldMatrix, worldMatrix, [scale.x, scale.y, scale.z])
        //
        var ve: vec3 = [0, 0, 0];
        vec3.add(ve, camera.cameraPos, camera.cameraFront);
        mat4.lookAt(viewMatrix, camera.cameraPos, ve, camera.cameraUp);


        mat4.perspective(projMatrix, glMatrix.toRadian(60), this.glService.canvas.clientWidth / this.glService.canvas.clientHeight, 0.1, 1000.0);

        this.glService.gl?.uniformMatrix4fv(this.getUniformLocation(shaderI.shader, 'mWorld'), this.glService.gl?.FALSE, worldMatrix);
        this.glService.gl?.uniformMatrix4fv(this.getUniformLocation(shaderI.shader, 'mView'), this.glService.gl?.FALSE, viewMatrix);
        this.glService.gl?.uniformMatrix4fv(this.getUniformLocation(shaderI.shader, 'mProj'), this.glService.gl?.FALSE, projMatrix);

        this.geometry && this.geometry.render();
    }

    private getUniformLocation(shader: Shader, uniformLocation: any) {
        return this.glService.gl?.getUniformLocation(shader.program, uniformLocation)
    }


}