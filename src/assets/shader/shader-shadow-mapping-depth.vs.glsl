#version 300 es  
precision mediump float;

in vec3 vertPosition;
in vec2 vertTexCoord;
in vec3 vertNormal;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {

    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0f);
}