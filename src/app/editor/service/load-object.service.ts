import { Injectable } from "@angular/core";
import { MeshType } from "../interface/MeshInterface";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Mesh } from "../class/Mesh";
import { Texture } from "../class/Texture";
import { OpenglService } from "./opengl.service";
import { SceneService } from "./scene.service";
import * as CANNON from 'cannon';
@Injectable({
    providedIn: 'root'
})
export class LoadObjectService {
    loader: any;
    gizmo: Mesh[] = [];
    constructor(
        private glService: OpenglService,
        private sceneService: SceneService) { }

    loadObject(urlObject: string, type: MeshType, world?: CANNON.World) {
        this.loader = new GLTFLoader();
        this.loader && this.loader.load(urlObject, (gltf: { scene: any; }) => {
            const model = gltf.scene;
            console.log(model);
            model.children.map((_: any) => {
                let mesh!: Mesh;
                let t;
                _.material.map && _.material.map.userData &&
                    (t = _.material.map.userData.mimeType.split('/'))

                if (t && t[1] == 'jpeg') {
                    t[1] = 'jpg'
                }
                _.geometry?.attributes &&
                    (mesh = new Mesh({
                        vertices: _.geometry.attributes.position.array,
                        normal: _.geometry.attributes.normal.array,
                        uv: _.geometry.attributes.uv.array,
                        indices: _.geometry.index.array
                    },
                        {
                            texture: _.material.map ? new Texture("assets/" + _.material.map.name + "." + t[1], this.glService) : undefined,
                            color: _.material.color
                        },
                        {
                            position: { x: _.position.x, y: _.position.y, z: _.position.z },
                            rotation: { x: _.rotation._x, y: _.rotation._y, z: _.rotation._z },
                            scale: _.scale
                        },
                        this.glService,
                        this.sceneService
                    ))
                mesh && (mesh.loadLight = (MeshType.Object == type));
                mesh && (mesh.name = _.name);
                mesh && (mesh.type = type);
                mesh && (mesh.id = String(new Date().valueOf() + Math.random()));

                if (world && _.name != "Plane") {
                    const boxShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
                    const boxBody = new CANNON.Body({ mass: 0, shape: boxShape });
                    boxBody.position.set(_.position.x, _.position.y, _.position.z);
                    mesh && (mesh.body = boxBody);
                    world.addBody(boxBody);
                } else if (world && _.name == "Plane") {
                    const boxShape = new CANNON.Box(new CANNON.Vec3(100, 0.1, 100));
                    const boxBody = new CANNON.Body({ mass: 0, shape: boxShape });
                    boxBody.position.set(_.position.x, _.position.y, _.position.z);
                    mesh && (mesh.body = boxBody);
                    world.addBody(boxBody);
                }

                if (MeshType.Light == type) {
                    mesh && this.sceneService.addLight(mesh);
                };

                (MeshType.Gizmo == type) && mesh && this.gizmo.push(mesh);

                if (MeshType.Object == type) {
                    mesh && this.sceneService.addMesh(mesh);
                }
            })
        });
    }




}
