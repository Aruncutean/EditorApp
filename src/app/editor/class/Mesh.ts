import { glMatrix, mat4, vec3 } from "gl-matrix";
import { OpenglService } from "../service/opengl.service";
import { CameraService } from "../service/camera.service";
import { Geometry, GeometryInterface } from "./Geometry";
import { ShaderInterface } from "../interface/ShaderInterface";
import { Texture } from "./Texture";
import { CoordonateInerface } from "../interface/CoordonateInterface";
import { MaterialInterface } from "../interface/MaterialInterface";
import { Shader } from "./Shader";

export class Mesh {

    coordonate!: CoordonateInerface;
    geometry!: Geometry;
    material!: MaterialInterface;
    name!: string;
    loadLight!:boolean;
    constructor(geometrySource: GeometryInterface,
        material: MaterialInterface,
        coordonate: CoordonateInerface,
        private glService: OpenglService
    ) {
        this.material = material;
        this.coordonate = coordonate;
        this.geometry = new Geometry(geometrySource, glService);
    }

    render(camera: CameraService, shaderI: ShaderInterface, lightPos?: any) {

        this.glService.gl?.useProgram(shaderI.shader.program);

        const matWorldUniformLocation = this.glService.gl?.getUniformLocation(shaderI.shader.program, 'mWorld');
        const matViewUniformLocation = this.glService.gl?.getUniformLocation(shaderI.shader.program, 'mView');
        const matProjUniformLocation = this.glService.gl?.getUniformLocation(shaderI.shader.program, 'mProj');
        const isTextureUniform = this.glService.gl?.getUniformLocation(shaderI.shader.program, 'isTexture');
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
            if (this.material.texture) {
                this.glService.gl?.uniform1f(isTextureUniform, 0);
                this.material.texture.renderTexture();

                this.glService.gl?.uniform1i(this.getUniformLocation(shaderI.shader, 'material.diffuse'), 0);
                lightPos && this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, 'light.position'),  lightPos.x, lightPos.y, lightPos.z);
                this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, 'viewPos'), camera.cameraPos[0], camera.cameraPos[1], camera.cameraPos[2]);

                this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, 'light.ambient'), 0.2, 0.2, 0.2);
                this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, 'light.diffuse'), 0.5, 0.5, 0.5);
                this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, 'light.specular'), 1.0, 1.0, 1.0);

                this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, 'material.specular'), 0.5, 0.5, 0.5);
                this.glService.gl?.uniform1f(this.getUniformLocation(shaderI.shader, 'material.shininess'), 64.0);


            } else {

                this.glService.gl?.uniform1f(isTextureUniform, 1);
                const colorUniform = this.glService.gl?.getUniformLocation(shaderI.shader.program, 'objectColor');
                if (this.loadLight == true) {
                    this.glService.gl?.uniform1f(this.getUniformLocation(shaderI.shader, 'loadLight'), 1);
                    const lightPosUniform = this.glService.gl?.getUniformLocation(shaderI.shader.program, 'lightPos');
                    const viewPosUniform = this.glService.gl?.getUniformLocation(shaderI.shader.program, 'viewPos');
                    const lightColorUniform = this.glService.gl?.getUniformLocation(shaderI.shader.program, 'lightColor');


                    lightPos && this.glService.gl?.uniform3f(lightPosUniform, lightPos.x, lightPos.y, lightPos.z);
                    this.glService.gl?.uniform3f(viewPosUniform, camera.cameraPos[0], camera.cameraPos[1], camera.cameraPos[2]);
                    this.glService.gl?.uniform3f(lightColorUniform, 1.0, 1.0, 1.0);
                } else {
                    this.glService.gl?.uniform1i(this.getUniformLocation(shaderI.shader, 'loadLight'), 0);
                }
                this.glService.gl?.uniform3f(colorUniform, this.material.color.r, this.material.color.g, this.material.color.b);
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


        this.glService.gl?.uniformMatrix4fv(matWorldUniformLocation, this.glService.gl?.FALSE, worldMatrix);
        this.glService.gl?.uniformMatrix4fv(matViewUniformLocation, this.glService.gl?.FALSE, viewMatrix);
        this.glService.gl?.uniformMatrix4fv(matProjUniformLocation, this.glService.gl?.FALSE, projMatrix);

        this.geometry && this.geometry.render();
    }

    getUniformLocation(shader: Shader, uniformLocation: any) {
        return this.glService.gl?.getUniformLocation(shader.program, uniformLocation)
    }


}