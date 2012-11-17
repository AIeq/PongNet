//! clones an object
function clone(obj) {
    return $.extend(true, {}, obj);
}

// data types
function Controller(maxSpeed) {
    this.maxSpeed = maxSpeed;
}

Randroller.prototype = new Controller();
function Randroller(maxSpeed) {
    Controller.call(this, maxSpeed);
}

Randroller.prototype.getNewValues = function(oldValues) {
    function randomInt(range) {
        return Math.floor((Math.random() * range));
    }

    var speed = oldValues.speed;
    if (speed == 0) {
        if (randomInt(10) == 0)
            speed = (randomInt(2) * 2 - 1) * this.maxSpeed;
    } else {
        if (randomInt(20) == 0)
            speed = -speed;
        if (randomInt(80) == 0)
            speed = 0;
    }
    return {
        position : oldValues.position,
        speed : speed
    };
}
function GameArea(size) {
    this.size = size || {
        x : 600,
        y : 400
    };
    this.center = {};
    this.center.x = this.size.x / 2;
    this.center.y = this.size.y / 2;

    // camera, scene and renderer
    // camera : fov, aspect, near, far
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.x += this.center.x;
    this.camera.position.y += this.center.y;
    this.camera.position.z = 300;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.CanvasRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // game area
    this.geometry = new THREE.CubeGeometry(this.size.x, this.size.y, 70);
    this.material = new THREE.MeshBasicMaterial({
        color : 0x00f00f,
        wireframe : true
    });
    this.material.side = THREE.DoubleSide;
    
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.x += this.center.x;
    this.mesh.position.y += this.center.y;
    this.scene.add(this.mesh);

    // game objects
    this.gameObjects = [new Paddle({
        x : 5,
        y : 300
    }, new Randroller(100)), new Paddle({
        x : 595,
        y : 200
    }, new Randroller(100)), new Ball(clone(this.center))];

    // get meshes
    for (var i = 0; i < this.gameObjects.length; ++i) {
        this.scene.add(this.gameObjects[i].getMesh());
    }
}

GameArea.prototype = {
    animate : function(time) {
        if (this.lastTime) {
            var tick = time - this.lastTime;
        } else {
            var tick = 0;
        }
        this.lastTime = time;

        for (var i = 0; i < this.gameObjects.length; ++i) {
            this.gameObjects[i].animate(tick);
        }
        this.renderer.render(this.scene, this.camera);
        
        // calls for a next update when possible
        var self = this;
        requestAnimationFrame(function(t) {
            self.animate(t);
        });
    },
    update : function(command) {

    },
};

function GameObject() {
    this.position = {
        x : 0,
        y : 0
    };
    this.speed = {
        x : 0,
        y : 0
    };
}

GameObject.prototype = {
    setPosition : function(position) {
        this.position = position;
    },
    setSize : function(size) {
        this.size = size;
    },
    setSpeed : function(speed) {
        this.speed = speed;
    },
    accelerate : function(value) {
        this.speed.x += value.x;
        this.speed.y += value.y;
    },
    getMesh : function() {
        return this.mesh;
    },
    setMeshPosition : function(position) {
        this.mesh.position.x = this.position.x;
        this.mesh.position.y = this.position.y;
    },
    animate : function(tick) {
        //this.position.x += this.speed.x * tick;
        //this.position.y += this.speed.y * tick;

        this.mesh.position.x = this.position.x;
        this.mesh.position.y = this.position.y;

        //console.log(this.mesh.position);
    }
};

Paddle.prototype = new GameObject();
Paddle.prototype.parent = GameObject.prototype;
function Paddle(position, controller, size) {
    GameObject.call(this);
    this.position = position;
    this.controller = controller;
    this.size = size || {
        x : 20,
        y : 100
    };

    this.geometry = new THREE.CubeGeometry(this.size.x, this.size.y, this.size.x);
    this.material = new THREE.MeshBasicMaterial({
        color : 0x0000ff,
        wireframe : true
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.setMeshPosition(this.position);
}

Paddle.prototype.setSize = function(size) {
    this.size = size;
}

Paddle.prototype.animate = function(tick) {
    var newValues = this.controller.getNewValues({
        position : this.position.y,
        speed : this.speed.y
    });

    this.speed.y = newValues.speed;
    this.position.y = newValues.position + this.speed.y * tick / 1000;

    this.mesh.position.y = this.position.y;
}

Ball.prototype = new GameObject();
Ball.prototype.parent = GameObject.prototype;
function Ball(position, radius) {
    GameObject.call(this);
    this.position = position;
    var r = 5 || radius;
    this.size = {
        x : r,
        y : r
    };

    this.geometry = new THREE.CubeGeometry(r, r, r);
    this.material = new THREE.MeshBasicMaterial({
        color : 0xff0000,
        wireframe : true
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.setMeshPosition(this.position);
}

Ball.prototype.setRadius = function(radius) {
    this.size.x = radius;
    this.size.y = radius;
}
Ball.prototype.animate = function(tick) {
    this.parent.animate.call(this);
    this.mesh.rotation.x += 0.005 * tick;
    this.mesh.rotation.y += 0.01 * tick;
}
function init() {

    var canvas = document.createElement("canvas");
    if (canvas.getContext) {
        // Hide the "Warning: could not load ...."
        document.getElementById('contentDiv').innerHTML = "";
    } else {
        div.innerHTML = "Your browser does not support canvas element.";
        return;
    }

    var gameArea = new GameArea();

    document.body.appendChild(gameArea.renderer.domElement);
    gameArea.animate(0);
}
