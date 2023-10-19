#version 300 es
precision mediump float;
layout(location = 0) in vec3 vertPosition;

out vec4 PickingColorOut;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform vec4 PickingColor;

void main() {
    PickingColorOut = PickingColor;

    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0f);
}