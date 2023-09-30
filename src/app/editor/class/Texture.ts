import { OpenglService } from "../service/opengl.service";

export class Texture {
    texture: any;
    constructor(src: string, private glService: OpenglService) {
        this.texture = glService.gl.createTexture()
        const cubeImage = new Image();
        cubeImage.src = src;
        cubeImage.onload = () => {
            glService.gl.bindTexture(glService.gl.TEXTURE_2D, this.texture);
            glService.gl.texImage2D(glService.gl.TEXTURE_2D, 0, glService.gl.RGBA, glService.gl.RGBA, glService.gl.UNSIGNED_BYTE, cubeImage);
            glService.gl.generateMipmap(glService.gl.TEXTURE_2D);
            glService.gl.texParameteri(glService.gl.TEXTURE_2D, glService.gl.TEXTURE_MIN_FILTER, glService.gl.LINEAR_MIPMAP_LINEAR);
            glService.gl.texParameteri(glService.gl.TEXTURE_2D, glService.gl.TEXTURE_MAG_FILTER, glService.gl.LINEAR);
            glService.gl.texParameteri(glService.gl.TEXTURE_2D, glService.gl.TEXTURE_WRAP_S, glService.gl.MIRRORED_REPEAT);
            glService.gl.texParameteri(glService.gl.TEXTURE_2D, glService.gl.TEXTURE_WRAP_T, glService.gl.MIRRORED_REPEAT);
        }
    }


    renderTexture() {
        this.glService.gl.activeTexture(this.glService.gl.TEXTURE0);
        this.glService.gl.bindTexture(this.glService.gl.TEXTURE_2D, this.texture);

    }

}