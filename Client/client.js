//var gameArea;

// data types

function GameArea(size) {
	this.size = size || {
		x : 600,
		y : 400
	};

	// camera, scene and renderer
	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
	this.camera.position.z = 1000;
	this.scene = new THREE.Scene();
	this.renderer = new THREE.CanvasRenderer();
	this.renderer.setSize(window.innerWidth, window.innerHeight);

	// game area
	this.geometry = new THREE.CubeGeometry(this.size.x, this.size.y, 10);
	this.material = new THREE.MeshBasicMaterial({
		color : 0x0000ff,
		wireframe : true
	});
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.scene.add(this.mesh);

	// game objects
	this.gameObjects = [new Paddle({
		x : 5,
		y : 300
	}), new Paddle({
		x : 595,
		y : 200
	}), new Ball()];
	// get meshes
	for (var i = 0; i < this.gameObjects.length; ++i) {
		this.scene.add(this.gameObjects[i].getMesh());
	}
}

GameArea.prototype = {
	animate : function(tick) {
		self = this;
		requestAnimationFrame(function(tick) {
			self.animate(tick);
		});

		for (var i = 0; i < this.gameObjects.length; ++i) {
			this.gameObjects[i].animate(tick);
		}
		this.renderer.render(this.scene, this.camera);

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
	animate : function(tick) {
		//this.position.x += this.speed.x * tick;
		//this.position.y += this.speed.y * tick;

		this.mesh.position.x = this.position.x;
		this.mesh.position.y = this.position.y;

		//console.log(this.mesh.position);
	}
};

Paddle.prototype = new GameObject();
Paddle.prototype.constructor = Paddle();
function Paddle(position, controller, size) {
	this.position = position;
	this.controller = controller;
	this.size = size || {
		x : 10,
		y : 50
	};

	this.geometry = new THREE.CubeGeometry(this.size.x, this.size.y, this.size.x);
	this.material = new THREE.MeshBasicMaterial({
		color : 0x0000ff,
		wireframe : true
	});

	this.mesh = new THREE.Mesh(this.geometry, this.material);
}

Paddle.prototype.setSize = function(size) {
	this.size = size;
}

Ball.prototype = new GameObject();
Ball.prototype.constructor = Ball();
function Ball(radius) {
	var r = 2 || radius;
	this.size = {
		x : r,
		y : r
	};
	this.position = {
		x : 0,
		y : 0
	};

	this.geometry = new THREE.CubeGeometry(r, r, r);
	this.material = new THREE.MeshBasicMaterial({
		color : 0xff0000,
		wireframe : true
	});

	this.mesh = new THREE.Mesh(this.geometry, this.material);
}

Ball.prototype.setRadius = function(radius) {
	this.size.x = radius;
	this.size.y = radius;
}
Ball.prototype.animate = function(tick) {
	this.mesh.rotation.x += 0.01;
	this.mesh.rotation.y += 0.02;
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
	gameArea.animate();
}
