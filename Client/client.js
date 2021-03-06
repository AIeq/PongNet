 
window.WebSocket = window.WebSocket || window.MozWebSocket;

if (!window.WebSocket) {
    alert("fail"); 
} else {
    // open connection
    var connection = new WebSocket('ws://127.0.0.1:7175');

    setInterval(function() {
        if (connection.readyState !== 1) {
            alert("Connection lost"); 
        }
    }, 3000);
}
var remoteValues = {position:false,speed:false};
  connection.onmessage = function (message) {

        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        } 
        
        if (json.type === 'color') {  
        // ignore
        } else if (json.type === 'history') { 
        // ignore
        } else if (json.type === 'message') { // it's a single message
            var msg = json.data.text; 
            
            if(msg.indexOf("**") == 0){  
                    var n=msg.split(","); 
                    remoteValues.position = parseFloat(n[1]);
                    remoteValues.speed = parseFloat(n[2]);
 
            }else{
                 
            }
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
        }
    };
 

//! clones an object
function clone(obj) {
    return $.extend(true, {}, obj);
}

function randomInt(range) {
    return Math.floor((Math.random() * range));
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
LocalController.prototype = new Controller();
function LocalController(maxSpeed, connection) {
    Controller.call(this, maxSpeed);
    this.connection = connection;
    this.firstMessage = true;
    this.up = 0;
    this.down = 0;
    this.dir = 0;
    this.oldValues={
        position : 0,
        speed : 0
    };
}

LocalController.prototype.getNewValues = function(oldValues) {

    var speed = this.dir * this.maxSpeed;
    var result ={
        position : oldValues.position,
        speed : speed
    };
    this.oldValues = result;
    return result;
}

LocalController.prototype.setKey = function(code, val) {
    switch(code) {
        case 38:
            this.up = val;
            this.dir = 1;
            break;
        case 40:
            this.down = val;
            this.dir = -1;
            break;
    }
    if (this.up + this.down < 2)
    this.dir = this.up - this.down;
        
     if(this.connection && connection.readyState == 1) {
        if(this.firstMessage){
            var name = localStorage.getItem("name");            
            this.connection.send(name || "error");
            this.firstMessage = false;
        }else{
            var speed = this.dir * this.maxSpeed;
            var msg = "**," + this.oldValues.position + "," + speed;
            this.connection.send(msg);
        }
    }
}

RemoteController.prototype = new Controller();
function RemoteController(maxSpeed, connection) {
    Controller.call(this, maxSpeed);
    this.values = false;
 
    
}

RemoteController.prototype.getNewValues = function(oldValues) {
    if(remoteValues.position) {
    return remoteValues;
    } else {
      return oldValues;
    }
}

RemoteController.prototype.setValues = function(values) {
    this.values = values;
}

function GameArea(size) {
    this.size = size || {
        x : 700,
        y : 400
    };
    this.center = {};
    this.center.x = this.size.x / 2;
    this.center.y = this.size.y / 2;

    // camera, scene and renderer
    // camera : fov, aspect, near, far
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.x += this.center.x;
    this.camera.position.y += this.center.y;
    this.camera.position.z = 500;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.CanvasRenderer();
    this.renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);

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
    var player = new LocalController(200, connection);

    $("body").keydown(function(e) {
        player.setKey(e.keyCode, 1);
    });

    $("body").keyup(function(e) {
        player.setKey(e.keyCode, 0);
    });
    var remotePlayer = new RemoteController(200, connection);


    // creating game objects
    var paddle1 = new Paddle({
        x : 5,
        y : 200
    }, player, this.size);
    var paddle2 = new Paddle({
        x : 695,
        y : 200
    }, remotePlayer, this.size);

    var ball = new Ball(clone(this.center), this.size, [paddle1, paddle2]);
    var bSpeed = 300;
    var r = 2 * Math.PI * Math.random();

    ball.setSpeed({
        x : bSpeed * Math.sin(r),
        y : bSpeed * Math.cos(r)
    });

    // game objects
    this.gameObjects = [paddle1, paddle2, ball];

    // get meshes
    for (var i = 0; i < this.gameObjects.length; ++i) {
        this.scene.add(this.gameObjects[i].getMesh());
    }

    // text
    var OPTIONS = {
        size : 100,
        height : 5,
        font : "helvetiker",
        weight : "bold"
    };

    var text = new THREE.TextGeometry("test", OPTIONS);
    var wrapper = new THREE.MeshNormalMaterial({color: 0xffffff});

    var words = new THREE.Mesh(text, wrapper);
    words.position.x = -300;
    words.position.y = 300;
    this.scene.add(words);
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
    }
};

Paddle.prototype = new GameObject();
Paddle.prototype.parent = GameObject.prototype;
function Paddle(position, controller, areaSize, size) {
    GameObject.call(this);
    this.position = position;
    this.controller = controller;
    this.areaSize = areaSize;

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
    newValues.position += this.speed.y * tick / 1000;

    // check new position
    this.collisionCheckedMove(newValues);
    this.mesh.position.y = this.position.y;
}

Paddle.prototype.collisionCheckedMove = function(newValues) {
    // checks if collides with game area borders
    var p = newValues.position;
    var s = this.size.y / 2;
    // only upper and lower limits
    p = Math.max(s, p);
    p = Math.min(this.areaSize.y - s, p);
    this.position.y = p;
}

Ball.prototype = new GameObject();
Ball.prototype.parent = GameObject.prototype;
function Ball(position, areaSize, paddles, radius) {
    GameObject.call(this);
    this.position = position;
    this.areaSize = areaSize;
    this.paddles = paddles;

    var r = 10 || radius;
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
    var move = {};
    move.position = {
        x : this.position.x + this.speed.x * tick / 1000,
        y : this.position.y + this.speed.y * tick / 1000
    };

    move.speed = this.speed;
    this.collisionCheckedMove(move);

    this.mesh.rotation.x += 5 * tick / 1000;
    this.mesh.rotation.y += 10 * tick / 1000;
    this.setMeshPosition(this.position);
}
Ball.prototype.collisionCheckedMove = function(move) {
    var p = move.position;
    var sX = this.size.x / 2;
    var sY = this.size.y / 2;

    // test paddles
    for (var i = 0; i < this.paddles.length; ++i) {
        if (this.collidePaddle(move, this.paddles[i], p, sX, sY)) {
            return;
        }
    }
    this.position = move.position;
    // checks if collides with game area borders
    if (p.y <= sY) {
        // collides lower border
        this.position.y = sY;
        this.speed.y = -this.speed.y;
    } else if (p.y >= this.areaSize.y - sY) {
        // collides upper border
        this.position.y = this.areaSize.y - sY;
        this.speed.y = -this.speed.y;
    } else if (p.x <= 0) {
        // collides left border
        this.goal(2);
    } else if (p.x >= this.areaSize.x) {
        // collides right border
        this.goal(1);
    }
}
Ball.prototype.goal = function(player) {
    // TODO Goaaalll
    this.speed = {
        x : 0,
        y : 0
    };
}
Ball.prototype.collidePaddle = function(move, paddle, p, sX, sY) {
    if (move.speed.x == 0 && move.speed.y == 0) {
        return false;
    }
    var b = false;
    if (paddle.position.x < 200) {
        // close to left wall
        if (p.x - sX <= paddle.position.x + paddle.size.x / 2) {
            // on paddle line
            var collisionX = paddle.position.x + paddle.size.x / 2 + sX;
            b = true;
        }
    } else if (paddle.position.x > this.areaSize.x - 200) {
        // right wall
        if (p.x + sX >= paddle.position.x - paddle.size.x / 2) {
            // on paddle line
            var collisionX = paddle.position.x - paddle.size.x / 2 - sX;
            b = true;
        }
    }

    if (b) {
        // check if y-axis hits paddle
        if ((p.y > paddle.position.y - paddle.size.y / 2) && (p.y < paddle.position.y + paddle.size.y / 2)) {
            // y-position matches
            this.position.x = collisionX;
            this.speed.x = -this.speed.x;
            return true;
        }
    }
    return false;
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
