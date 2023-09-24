
import { OpenglService } from "../service/opengl.service";
import { SceneService } from "../service/scene.service";
import { Scene } from "../interface/SceneInterface";
import { Light } from "../interface/LightInterface";
import { Shader } from "./Shader";
import { ShaderInterface } from "../interface/ShaderInterface";

export class LightProcessing {

    private light!: Light[];
    private dirLight!: Light;
    constructor(
        private glService: OpenglService,
        private sceneService: SceneService
    ) {
        this.sceneService.data$.subscribe((_: Scene) => {
            this.light = _.light;
            this.dirLight = _.dirLight;
        })
    }

    processing(shaderI: ShaderInterface) {

        let pos = this.dirLight.position;
        pos && this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, "dirLight.direction"), pos.x, pos.y, pos.z);
        this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, "dirLight.ambient"), this.dirLight.ambient?.[0], this.dirLight.ambient?.[1], this.dirLight.ambient?.[2]);
        this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, "dirLight.diffuse"), this.dirLight.diffuse?.[0], this.dirLight.diffuse?.[1], this.dirLight.diffuse?.[2]);
        this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, "dirLight.specular"), this.dirLight.specular?.[0], this.dirLight.specular?.[1], this.dirLight.specular?.[2]);


        this.light && this.glService.gl?.uniform1f(this.getUniformLocation(shaderI.shader, 'nrLight'), this.light.length);
        this.light && this.light.forEach((_, index) => {
            let pos = _.mesh && _.mesh.coordonate.position;
            pos && this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, 'pointLights[' + index + '].position'), pos.x, pos.y, pos.z);
            this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, 'pointLights[' + index + '].ambient'), _.ambient?.[0], _.ambient?.[1], _.ambient?.[2]);
            this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, 'pointLights[' + index + '].diffuse'), _.diffuse?.[0], _.diffuse?.[1], _.diffuse?.[2]);
            this.glService.gl?.uniform3f(this.getUniformLocation(shaderI.shader, 'pointLights[' + index + '].specular'), _.specular?.[0], _.specular?.[1], _.specular?.[2]);
            this.glService.gl?.uniform1f(this.getUniformLocation(shaderI.shader, 'pointLights[' + index + '].constant'), 1);
            this.glService.gl?.uniform1f(this.getUniformLocation(shaderI.shader, 'pointLights[' + index + '].linear'), 0.14);
            this.glService.gl?.uniform1f(this.getUniformLocation(shaderI.shader, 'pointLights[' + index + '].quadratic'), 0.07);

        })
    }

    private getUniformLocation(shader: Shader, uniformLocation: any) {
        return this.glService.gl?.getUniformLocation(shader.program, uniformLocation)
    }
}