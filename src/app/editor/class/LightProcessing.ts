
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
        private sceneService: SceneService
    ) {
        this.sceneService.data$.subscribe((_: Scene) => {
            this.light = _.light;
            this.dirLight = _.dirLight;
        })
    }

    processing(shader: Shader) {

        let pos = this.dirLight.position;
        pos && shader.sendVec3N("dirLight.direction", [pos.x, pos.y, pos.z])
        this.dirLight.ambient && shader.sendVec3V("dirLight.direction", this.dirLight.ambient);
        this.dirLight.diffuse && shader.sendVec3V("dirLight.direction", this.dirLight.diffuse)
        this.dirLight.specular && shader.sendVec3V("dirLight.direction", this.dirLight.specular)
        shader.sendInt("nrLight", this.light.length)

        this.light && this.light.forEach((_, index) => {
            let pos = _.mesh && _.mesh.coordonate.position;
            pos && shader.sendVec3N('pointLights[' + index + '].position', [pos.x, pos.y, pos.z])
            _.ambient && shader.sendVec3V('pointLights[' + index + '].ambient', _.ambient);
            _.diffuse && shader.sendVec3V('pointLights[' + index + '].diffuse', _.diffuse)
            _.specular && shader.sendVec3V('pointLights[' + index + '].specular', _.specular)
            shader.sendFloat('pointLights[' + index + '].constant', 1);
            shader.sendFloat('pointLights[' + index + '].linear', 0.14);
            shader.sendFloat('pointLights[' + index + '].quadratic', 0.07);

        })
    }
}