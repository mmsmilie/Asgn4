class Camera {
    constructor(canvas) {
        this.fov = 60.0;
        this.eye = new Vector3([0,0,0]);
        this.at = new Vector3([0,0,-8]);
        this.up = new Vector3([0,1,0]);

        this.updown = 0;

        this.canvas = canvas

        this.speed = .1; // Speed of the camera
        this.alpha = 5; // Rotational Speed of the camera
        
        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        //console.log(this.viewMatrix);
        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 100);
    }

    setMatrixes(){
        this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        this.projectionMatrix.setPerspective(this.fov, this.canvas.width/this.canvas.height, 0.1, 100);
    }

    moveForward(){
        //console.log("Forward");
        let f = new Vector3();

        f.set(this.at);
        
        f.sub(this.eye);

        f.normalize();

        f.mul(this.speed);

        //console.log(f);

        this.eye.add(f);
        this.at.add(f);

        this.setMatrixes();
    }

    moveBackward(){
        //console.log("Backward");
        let b = new Vector3();
    
        b.set(this.eye);
        
        b.sub(this.at); 
    
        b.normalize(); 
    
        b.mul(this.speed);
    
        //console.log(b);

        this.eye.add(b); 
        this.at.add(b); 
        this.setMatrixes();
    }

    moveLeft(){
        //console.log("Left");
        let f = new Vector3();

        f.set(this.at);

        f.sub(this.eye);
        f.normalize();
        //f.mul(this.speed);

        let s = new Vector3();
        s = Vector3.cross(this.up, f);

        s.mul(this.speed);

        //console.log(s);

        this.eye.add(s);
        this.at.add(s);
        this.setMatrixes();
    }

    moveRight(){
        //console.log("Right");
        let f = new Vector3();

        f.set(this.at);

        f.sub(this.eye);
        f.normalize();
        //f.mul(this.speed);

        let s = new Vector3();
        s = Vector3.cross(f, this.up);

        s.mul(this.speed);

        //console.log(s);

        this.eye.add(s);
        this.at.add(s); 
        this.setMatrixes();
    }

    panLeft(){
        //console.log("Turning Left");
        let f = new Vector3();
    
        // Calculate the forward vector
        f.set(this.at);
        f.sub(this.eye);  // f = at - eye
        f.normalize();    // Normalize f to have unit length
    
        // Create a rotation matrix
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    
        // Rotate the forward vector
        f = rotationMatrix.multiplyVector3(f); // Store the result of rotation into f
    
        // Update the 'at' vector
        this.at.set(this.eye).add(f); // at = eye + f_prime
        this.setMatrixes();
    }
    
    panRight(){
        //console.log("Turning Right");
        let f = new Vector3();
    
        // Calculate the forward vector
        f.set(this.at);
        f.sub(this.eye);  // f = at - eye
        f.normalize();    // Normalize f to have unit length
    
        // Create a rotation matrix
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    
        // Rotate the forward vector
        f = rotationMatrix.multiplyVector3(f); // Store the result of rotation into f
    
        // Update the 'at' vector
        this.at.set(this.eye).add(f); // at = eye + f_prime
        this.setMatrixes();
    }

    panUp(){
        if (this.updown > 88) {
            return;
        }

        let f = new Vector3();
        let r = new Vector3();
    
        // Calculate the forward vector
        f.set(this.at);
        f.sub(this.eye);  // f = at - eye
        f.normalize();    // Normalize f to have unit length
    
        // Calculate the right vector as the cross product of forward vector and up vector
        r = Vector3.cross(f, this.up);
        r.normalize();
    
        // Create a rotation matrix
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(this.alpha, r.elements[0], r.elements[1], r.elements[2]);
        this.updown += this.alpha;
    
        // Rotate the forward vector
        f = rotationMatrix.multiplyVector3(f); // Store the result of rotation into f
    
        // Update the 'at' vector
        this.at.set(this.eye).add(f); // at = eye + f
        this.setMatrixes();
    }
    
    panDown(){
        if (this.updown < -88) {
            return;
        }
        let f = new Vector3();
        let r = new Vector3();
    
        // Calculate the forward vector
        f.set(this.at);
        f.sub(this.eye);  // f = at - eye
        f.normalize();    // Normalize f to have unit length
    
        // Calculate the right vector as the cross product of forward vector and up vector
        r = Vector3.cross(f, this.up);
        r.normalize();
    
        // Create a rotation matrix
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-this.alpha, r.elements[0], r.elements[1], r.elements[2]);
        this.updown -= this.alpha;
    
        // Rotate the forward vector
        f = rotationMatrix.multiplyVector3(f); // Store the result of rotation into f
    
        // Update the 'at' vector
        this.at.set(this.eye).add(f); // at = eye + f
        this.setMatrixes();
    }
    
    setPosition(x, y, z){
        this.eye.elements[0] = x;
        this.eye.elements[1] = y;
        this.eye.elements[2] = z;

        this.at.elements[0] = this.at.elements[0] + x;
        this.at.elements[1] = this.at.elements[1] + y;
        this.at.elements[2] = this.at.elements[2] + z;
    }
}
