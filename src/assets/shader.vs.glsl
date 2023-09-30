#version 300 es
precision mediump float;

in vec3 vertPosition;
in vec2 vertTexCoord;
in vec3 vertNormal;

out vec2 fragTexCoord;
out vec3 Normal;
out vec3 FragPos;
out vec4 FragPosLightSpace;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform mat4 lightSpaceMatrix;
void main() {
  fragTexCoord = vertTexCoord;

  FragPos = vec3(mWorld * vec4(vertPosition, 1.0f));
  FragPosLightSpace = lightSpaceMatrix * vec4(FragPos, 1.0f);
  Normal = mat3(transpose(inverse(mWorld))) * vertNormal;
  gl_Position = mProj * mView * vec4(FragPos, 1.0f);
}