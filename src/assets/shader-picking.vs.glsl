precision mediump float;
attribute vec3 vertPosition;
attribute vec2 vertTexCoord;
attribute vec3 vertNormal;
varying vec4 PickingColorOut;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform vec4 PickingColor;

void main() {
    PickingColorOut = PickingColor;

    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}