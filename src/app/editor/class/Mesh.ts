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
import { Scene } from "../interface/SceneInterface";
import { Light } from "../interface/LightInterface";

export class Mesh implements MeshInterface {
    id!: string;
    coordonate!: CoordonateInerface;
    geometry!: Geometry;
    material!: MaterialInterface;
    name!: string;
    loadLight!: boolean;
    type!: MeshType;
    body: any;

    lightSpaceMatrix: any = new Float32Array(16);
    modelMatrix = new Float32Array(16);
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
        this.lightProcessing = new LightProcessing(sceneService)
    }

    renderForward(camera: CameraService, shaderI: ShaderInterface, buffer?: any, lightSpaceMatrix?: any) {
        const shader = shaderI.shader;
        shader.useShader();

        /// shader.sendVec2("u_resolution", [this.glService.canvas.clientWidth, this.glService.canvas.clientHeight]);
        shader.sendBool('loadLight', this.loadLight)

        if (shaderI.isMousePicking == true && shaderI.indexMousePicking) {
            shader.sendVec4('PickingColor', [
                ((shaderI.indexMousePicking >> 0) & 0xFF) / 0xFF,
                ((shaderI.indexMousePicking >> 8) & 0xFF) / 0xFF,
                ((shaderI.indexMousePicking >> 16) & 0xFF) / 0xFF,
                ((shaderI.indexMousePicking >> 24) & 0xFF) / 0xFF]);
        }
        else {
            shader.sendVec3V('viewPos', camera.cameraPos);

            if (this.material.texture) {
                shader.sendInt('shadowMap', 1);
                shader.sendInt('material.diffuse', 0);
                shader.sendFloat('material.shininess', 32.0);
                shader.sendFloat('isTexture', 0);
                shader.sendVec3N('material.specular', [0.5, 0.5, 0.5])

                this.glService.activeTexture(0, this.material.texture.id);
                buffer && this.glService.activeTexture(1, buffer);

                this.lightProcessing.processing(shader);
            } else {
                shader.sendFloat('isTexture', 1);
                shader.sendVec3N('objectColor', this.material.color)
            }
        }
        shaderI.coordonate && this.modelCoordonate(shaderI.coordonate);
        !shaderI.coordonate && this.modelCoordonate();
        shader.setMat4('mWorld', this.modelMatrix);
        shader.setMat4('mView', shaderI.viewMatrix);
        shader.setMat4('mProj', shaderI.projMatrix);
        lightSpaceMatrix && shader.setMat4('lightSpaceMatrix', lightSpaceMatrix);

        this.geometry && this.geometry.render();
    }

    renderDeferred(camera: CameraService, shaderI: ShaderInterface) {
        const shader = shaderI.shader;
        shader.useShader();

        if (this.material.texture) {
            shader.sendInt('texture_diffuse1', 0);
            shader.sendInt('texture_specular1', 1);
            this.glService.activeTexture(0, this.material.texture.id);
            this.glService.activeTexture(1, this.material.texture.id);
        }

        this.modelCoordonate();
        shader.setMat4('model', this.modelMatrix);
        shader.setMat4('view', shaderI.viewMatrix);
        shader.setMat4('projection', shaderI.projMatrix);

        this.geometry && this.geometry.render();
    }

    modelCoordonate(coordonate?: any) {
        mat4.identity(this.modelMatrix);
        if (coordonate) {
            mat4.translate(this.modelMatrix, this.modelMatrix, [coordonate.x, coordonate.y, coordonate.z])
        } else {
            let poz: any = this.coordonate.position;
            this.body && (poz = this.body.position)
            this.body && (this.coordonate.position = this.body.position)
            poz.x !== undefined ? mat4.translate(this.modelMatrix, this.modelMatrix, [poz.x, poz.y, poz.z]) :
                mat4.translate(this.modelMatrix, this.modelMatrix, [poz[0], poz[1], poz[2]])
            let scale: any = this.coordonate.scale;
            mat4.scale(this.modelMatrix, this.modelMatrix, [scale.x, scale.y, scale.z])

            let rotation: any = this.coordonate.rotation;
            mat4.rotateX(this.modelMatrix, this.modelMatrix, rotation.x * Math.PI / 180)
            mat4.rotateY(this.modelMatrix, this.modelMatrix, rotation.y * Math.PI / 180)
            mat4.rotateZ(this.modelMatrix, this.modelMatrix, rotation.z * Math.PI / 180)
        }
    }

}