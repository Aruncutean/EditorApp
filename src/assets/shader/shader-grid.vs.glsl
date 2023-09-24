#version 300 es
precision mediump float;
in vec3 vertPosition;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

uniform float fogDistance;

uniform vec3 cameraPosition;

out float fogFactor;
out vec2 TexCoords;

void main() {
    float distanceToCamera = length(vertPosition - cameraPosition);
    fogFactor = (fogDistance - distanceToCamera) / fogDistance;
    fogFactor = clamp(fogFactor, 0.0f, 1.0f);
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0f);
    TexCoords = vertPosition.xz;
}