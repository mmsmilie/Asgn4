class Sphere {
    /**
     * Initializes a new instance of the Sphere class.
     *
     * @param {Matrix4} matrix - The matrix used for transformations.
     * @param {number} [latitudeBands=30] - The number of latitude bands.
     * @param {number} [longitudeBands=30] - The number of longitude bands.
     */
    constructor(matrix, latitudeBands = 30, longitudeBands = 30) {
        const radius = 0.5;
        const vertices = [];
        const indices = [];
    
        for (let latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
            const theta = latNumber * Math.PI / latitudeBands;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
    
            for (let longNumber = 0; longNumber <= longitudeBands; ++longNumber) {
                const phi = longNumber * 2 * Math.PI / longitudeBands;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
    
                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;
                const u = 1 - (longNumber / longitudeBands);
                const v = 1 - (latNumber / latitudeBands);
    
                vertices.push(x * radius);
                vertices.push(y * radius);
                vertices.push(z * radius);
                vertices.push(u);
                vertices.push(v);
                // Invert normals
                vertices.push(-x);
                vertices.push(-y);
                vertices.push(-z);
            }
        }
    
        for (let latNumber = 0; latNumber < latitudeBands; ++latNumber) {
            for (let longNumber = 0; longNumber < longitudeBands; ++longNumber) {
                const first = (latNumber * (longitudeBands + 1)) + longNumber;
                const second = first + longitudeBands + 1;
                indices.push(first);
                indices.push(second);
                indices.push(first + 1);
    
                indices.push(second);
                indices.push(second + 1);
                indices.push(first + 1);
            }
        }
    
        this.vertices = new Float32Array(vertices);
        this.indices = new Uint16Array(indices);
    
        this.rgba = [1.0, 0.0, 0.0, 1.0]; // Default to red
        this.matrix = new Matrix4(matrix);
        this.buffer = null;
        this.indexBuffer = null;
        this.whichTexture = 0;
    }
    

    setRgba(r, g, b, a) {
        this.rgba = [r, g, b, a];
    }

    setTextChoice(choice) {
        this.whichTexture = choice;
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

    render(norm,lite) {
        gl.uniform4f(u_FragColor, this.rgba[0], this.rgba[1], this.rgba[2], this.rgba[3]);
        gl.uniform1i(u_whichTexture, this.whichTexture);
        gl.uniform1i(u_lightOn, lite);
        gl.uniform1i(u_normalOn, norm);
    
        if (this.buffer == null) {
            this.buffer = gl.createBuffer();
        }
    
        if (this.indexBuffer == null) {
            this.indexBuffer = gl.createBuffer();
        }
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    
        const FSIZE = this.vertices.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 8 * FSIZE, 0);
        gl.enableVertexAttribArray(a_Position);
    
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 8 * FSIZE, 3 * FSIZE);
        gl.enableVertexAttribArray(a_UV);
    
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 8 * FSIZE, 5 * FSIZE);
        gl.enableVertexAttribArray(a_Normal);
    
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}
