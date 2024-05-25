class Cube {

    constructor(matrix) {
        this.vertices = new Float32Array([
            // Vertex positions and UV coordinates for each face of the cube
            // Front face
            -0.5, -0.5,  0.5, 0.0, 0.0,
             0.5, -0.5,  0.5, 1.0, 0.0,
             0.5,  0.5,  0.5, 1.0, 1.0,
            -0.5,  0.5,  0.5, 0.0, 1.0,
            // Back face
            -0.5, -0.5, -0.5, 0.0, 0.0,
             0.5, -0.5, -0.5, 1.0, 0.0,
             0.5,  0.5, -0.5, 1.0, 1.0,
            -0.5,  0.5, -0.5, 0.0, 1.0,
            // Top face
            -0.5,  0.5, -0.5, 0.0, 0.0,
            -0.5,  0.5,  0.5, 1.0, 0.0,
             0.5,  0.5,  0.5, 1.0, 1.0,
             0.5,  0.5, -0.5, 0.0, 1.0,
            // Bottom face
            -0.5, -0.5, -0.5, 0.0, 0.0,
            -0.5, -0.5,  0.5, 1.0, 0.0,
             0.5, -0.5,  0.5, 1.0, 1.0,
             0.5, -0.5, -0.5, 0.0, 1.0,
            // Right face
             0.5, -0.5, -0.5, 0.0, 0.0,
             0.5,  0.5, -0.5, 1.0, 0.0,
             0.5,  0.5,  0.5, 1.0, 1.0,
             0.5, -0.5,  0.5, 0.0, 1.0,
            // Left face
            -0.5, -0.5, -0.5, 0.0, 0.0,
            -0.5,  0.5, -0.5, 1.0, 0.0,
            -0.5,  0.5,  0.5, 1.0, 1.0,
            -0.5, -0.5,  0.5, 0.0, 1.0
        ]);

        this.indices = new Uint16Array([
            // Front face
            0, 1, 2, 0, 2, 3,
            // Back face
            4, 5, 6, 4, 6, 7,
            // Top face
            8, 9, 10, 8, 10, 11,
            // Bottom face
            12, 13, 14, 12, 14, 15,
            // Right face
            16, 17, 18, 16, 18, 19,
            // Left face
            20, 21, 22, 20, 22, 23
        ]);

        this.rgba = [1.0, 0.0, 0.0, 1.0]; // Default to red
        this.matrix = new Matrix4(matrix);
        this.buffer = null;
        this.indexBuffer = null;

        this.textColorRatio = 1.0;
        this.textChoice = 0;
    }

    setRgba(r, g, b, a) {
        this.rgba = [r, g, b, a];
    }

    setTextColorRatio(ratio) {
        this.textColorRatio = ratio;
    }

    setTextChoice(choice) {
        this.textChoice = choice;
    }

    setMatrix(matrix) {
        this.matrix.set(matrix);
    }

    rotate(angle, x, y, z) {
        this.matrix.rotate(angle, x, y, z);
    }

    translate(x, y, z) {
        this.matrix.translate(x, y, z);
    }

    scale(x, y, z) {
        this.matrix.scale(x, y, z);
    }

    render() {
        gl.uniform4f(u_FragColor, this.rgba[0], this.rgba[1], this.rgba[2], this.rgba[3]);
        gl.uniform1f(u_textColorWeight, this.textColorRatio);
        gl.uniform1f(u_TextureChoose, this.textChoice);

        if(this.buffer == null) {
            this.buffer = gl.createBuffer();
            this.indexBuffer = gl.createBuffer();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        const FSIZE = this.vertices.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 5 * FSIZE, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 5 * FSIZE, 3 * FSIZE);
        gl.enableVertexAttribArray(a_UV);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}
