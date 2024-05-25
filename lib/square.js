class Square {

    constructor(matrix) {
        this.vertices = new Float32Array([
            // Vertex positions and UV coordinates
            -0.5, -0.5, 0.0, 0.0, 0.0,
             0.5, -0.5, 0.0, 1.0, 0.0,
             0.5,  0.5, 0.0, 1.0, 1.0,
            -0.5, -0.5, 0.0, 0.0, 0.0,
             0.5,  0.5, 0.0, 1.0, 1.0,
            -0.5,  0.5, 0.0, 0.0, 1.0,
          ]);

        this.rgba = [1.0, 0.0, 0.0, 1.0]; // Default to Red       

        this.matrix = new Matrix4(matrix);

        this.buffer = null;

        this.textColorRatio = 1.0;

        this.textChoice = 0;
    }

    setRgba(r, g, b, a) {
        rgba = [r, g, b, a];
    }

    setTextColorRatio(ratio) {
        textColorRatio = ratio;
    }

    setTextChoice(choice) {
        textChoice = choice;
    }

    setMatrix(matrix) {
        matrix.set(matrix);
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
    render(){

        //console.log("Rendering");

        gl.uniform4f(u_FragColor, this.rgba[0], this.rgba[1], this.rgba[2], this.rgba[3]);
        gl.uniform1f(u_textColorWeight, this.textColorRatio);
        gl.uniform1f(u_TextureChoose, this.textChoice);

        if(this.buffer == null) {
            this.buffer = gl.createBuffer();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        const FSIZE = this.vertices.BYTES_PER_ELEMENT;

        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 5 * FSIZE, 0);
        gl.enableVertexAttribArray(a_Position);
  
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 5 * FSIZE, 3 * FSIZE); // Set up UV attribute pointer
        gl.enableVertexAttribArray(a_UV);

        this.matrix.translate(0, 0, 0);
        this.matrix.scale(0.25, 0.25, 0.25);

        gl.uniformMatrix4fv(u_ModelMatrix,false, this.matrix.elements);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}
