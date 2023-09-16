#version 300 es
precision mediump float;

in vec2 fragTexCoord;
in vec3 Normal;
in vec3 FragPos;

struct Material {
    sampler2D diffuse;
    vec3 specular;
    float shininess;
};

struct Light {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

uniform float isTexture;
uniform vec3 lightPos;
uniform vec3 viewPos;
uniform vec3 lightColor;
uniform vec3 objectColor;
uniform bool loadLight;
uniform Material material;
uniform Light light;

out vec4 FragColor;

void main() {
    if(isTexture == float(0)) {
        vec3 ambient = light.ambient * texture(material.diffuse, fragTexCoord).rgb;

    // diffuse 
        vec3 norm = normalize(Normal);
        vec3 lightDir = normalize(light.position - FragPos);
        float diff = max(dot(norm, lightDir), 0.0f);
        vec3 diffuse = light.diffuse * diff * texture(material.diffuse, fragTexCoord).rgb;  

    // specular
        vec3 viewDir = normalize(viewPos - FragPos);
        vec3 reflectDir = reflect(-lightDir, norm);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0f), material.shininess);
        vec3 specular = light.specular * (spec * material.specular);

        vec3 result = ambient + diffuse + specular;
        FragColor = vec4(result, 1.0f);

    } else {
        if(loadLight == true) {
            float ambientStrength = 0.1f;
            vec3 ambient = ambientStrength * lightColor;

    // diffuse 
            vec3 norm = normalize(Normal);
            vec3 lightDir = normalize(lightPos - FragPos);
            float diff = max(dot(norm, lightDir), 0.0f);
            vec3 diffuse = diff * lightColor;

    // specular
            float specularStrength = 0.5f;
            vec3 viewDir = normalize(viewPos - FragPos);
            vec3 reflectDir = reflect(-lightDir, norm);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0f), 32.0f);
            vec3 specular = specularStrength * spec * lightColor;

            vec3 result = (ambient + diffuse + specular) * objectColor;
            FragColor = vec4(result, 1.0f);
        } else {
            FragColor = vec4(objectColor, 1.0f);
        }
    }
}