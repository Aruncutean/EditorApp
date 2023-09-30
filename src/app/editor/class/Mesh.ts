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
    private dirLight!: Light;
    lightSpaceMatrix: any = new Float32Array(16);
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

        this.sceneService.data$.subscribe((_: Scene) => {
            this.dirLight = _.dirLight;
        })
    }

    renderForward(camera: CameraService, shaderI: ShaderInterface, ortho: boolean = false, buffer?: any) {
        const shader = shaderI.shader;
        shader.useShader();
        if (!ortho) {
            shader.sendVec2("u_resolution", [this.glService.canvas.clientWidth, this.glService.canvas.clientHeight]);
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
                    shader.sendInt('material.shininess', 32.0);
                    shader.sendFloat('isTexture', 0);
                    shader.sendVec3N('material.specular', [0.5, 0.5, 0.5])

                    this.glService.activeTexture(0, this.material.texture.id);
                    this.glService.activeTexture(1, buffer);

                    this.lightProcessing.processing(shader);
                } else {
                    shader.sendFloat('isTexture', 1);
                    shader.sendVec3N('objectColor', this.material.color)
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

        if (ortho) {
            mat4.ortho(projMatrix, -30.0, 30.0, -30.0, 30.0, -20.0, 20)
            this.dirLight.position && mat4.lookAt(viewMatrix, [-this.dirLight.position?.x, -this.dirLight.position?.y, -this.dirLight.position?.z], camera.cameraFront, camera.cameraUp);
            mat4.mul(this.lightSpaceMatrix, projMatrix, viewMatrix);
        } else {
            mat4.perspective(projMatrix, glMatrix.toRadian(60), this.glService.canvas.clientWidth / this.glService.canvas.clientHeight, 0.1, 1000.0);
            mat4.lookAt(viewMatrix, camera.cameraPos, camera.cameraFront, camera.cameraUp);
        }

        shader.setMat4('mWorld', worldMatrix);
        shader.setMat4('mView', viewMatrix);
        shader.setMat4('mProj', projMatrix);
        shader.setMat4('lightSpaceMatrix', this.lightSpaceMatrix);

        this.geometry && this.geometry.render();

    }

    renderDeferred(camera: CameraService, shaderI: ShaderInterface) {
        const shader = shaderI.shader;
        shader.useShader();

        let worldMatrix = new Float32Array(16);
        let viewMatrix = new Float32Array(16);
        let projMatrix = new Float32Array(16);

        if (this.material.texture) {
            shader.sendInt('texture_diffuse1', 0);
            shader.sendInt('texture_specular1', 1);
            this.glService.activeTexture(0, this.material.texture.id);
            this.glService.activeTexture(1, this.material.texture.id);

        }
        mat4.identity(worldMatrix);
        let poz: any = this.coordonate.position;

        poz.x !== undefined ? mat4.translate(worldMatrix, worldMatrix, [poz.x, poz.y, poz.z]) :
            mat4.translate(worldMatrix, worldMatrix, [poz[0], poz[1], poz[2]])
        let scale: any = this.coordonate.scale;
        mat4.scale(worldMatrix, worldMatrix, [scale.x, scale.y, scale.z])

        mat4.perspective(projMatrix, glMatrix.toRadian(60), this.glService.canvas.clientWidth / this.glService.canvas.clientHeight, 0.1, 100.0);
        mat4.lookAt(viewMatrix, camera.cameraPos, camera.cameraFront, camera.cameraUp);

        shader.setMat4('model', worldMatrix);
        shader.setMat4('view', viewMatrix);
        shader.setMat4('projection', projMatrix);

        this.geometry && this.geometry.render();
    }

}