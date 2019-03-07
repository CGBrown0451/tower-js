// JavaScript source code

//======================FRINGE OBJECT CLASSES======================
class Button{

	constructor(action, param, x, y, sprite, scene) {

		this.action = action;
		this.param = param;
		this.x = x;
		this.y = y;
		this.scene = scene;
		this.button = this.scene.add.sprite(x, y, sprite).setInteractive();

		var func = press.bind(this);
		this.button.on('pointerdown', func);
	}
};

function press() {


	//this is based on the type of button you've made.

	//make a change scene_button.
	var found = false;

	switch (this.action) {

		case "log":
			console.log(this.param);
			found = true;
			break;
		case "changeScene":
			this.scene.scene.start(this.param);
			found = true;
			break;
			
	}
	if (!found) {
		console.error("No such function as " + this.action);
	}
}


//======================GAME OBJECT CLASSES======================

//Actors are either the player or NPCs. Are controlled by the Controller class. 
class Actor {

	constructor(id, scene, sprite, x, y, rotation, controller, speed, hp, weapon) {

		this.id = id;
		this.scene = scene;
		this.position;
		this.sprite = this.scene.matter.add.image(x, y, sprite);
		this.sprite.rotation = rotation;
		this.controller = controller;
		this.controller.parent = this;
		this.speed = speed;
		this.maxhp = hp;
		this.hp = hp;
		this.weapon = weapon;
		this.path = [];
		this.pathing = false;
		this.stateid = 0;

	}

	create() {

	}

	moveTo(point) {
		//Asks navmesh.js nicely to find a path. Starts navigating if it does.
		var path = this.scene.navMesh.findPath({ x: this.sprite.x, y: this.sprite.y }, point);
		if (path != null) {
			console.log("path found");
			this.pathing = true;
			this.path = path;
		} else {

			console.log("path not found");

		}

	}

	dodgeInDirection(degs) {

	}

	shootAt(point) {

		console.log("pew");

	}

	moveInDirection(degs, relspeed) {

	}

	lookAt(point) {

		var dir = pointtopoint(this.position, point, true);

	}

	moveAlongPath(delta) {

		var nextpoint = this.path[0];
		var dist = pointtopoint(this.position, nextpoint, false);
		var dir = new Phaser.Math.Vector2(dist);
		dir.normalize();
		dist = new Phaser.Math.Vector2(dist);
		if (dist.length() < this.speed) {

			this.path.shift();
			if (this.path.length > 0) {

				nextpoint = this.path[0];

			} else {

				this.pathing = false;
				this.sprite.setVelocity(0, 0);
				return;

			}
			

		}

		var go = dir.multiply(new Phaser.Math.Vector2(this.speed, this.speed));
		this.sprite.setVelocity(go.x, go.y);
		

	}

	update(delta) {
		delta = delta / 1000;
		this.position = new Phaser.Geom.Point(this.sprite.x, this.sprite.y);
		this.controller.update();
		switch (this.stateid) {

			case 0:
				{

					if (this.pathing) {
						this.moveAlongPath(delta);
					}

				}
			break;

			case 1:
				{

				}
			break;

		}

	}

	destroy() {

	}

}

//Props are chairs, tables, potted plants, or anything that generally doesn't interact with the player.
class Prop{

	constructor(id, scene, sprite, x, y, rotation, hp, weight) {

		this.id = id;
		this.scene = scene;
		this.sprite = this.scene.matter.add.image(x, y, sprite);
		this.sprite.rotation = rotation;
		this.maxhp = hp;
		this.hp = this.maxhp;
		this.weight = weight;

	}

	destroy() {

	}

}


//Projectiles are things that fly through the air and hit stuff, and apply damage to them.
class Projectile{

	constructor(id, scene, sprite, x, y, rotation, projectileData) {

		this.id = id;
		this.scene = scene;
		this.sprite = this.scene.Matter.add.image(x, y, sprite);
		this.sprite.rotation = rotation;
		this.data = projectileData;

	}

}


//======================Controller Classes======================
class TouchController {

	constructor(presslength, swipesens) {

		this.presslength = presslength;
		this.swipesens = swipesens;
		this.parent;
		this.stRegister = false;
		this.ltRegister = false;
		this.touchProperties;
		//Initialising ZingTouch
		this.zt = ZingTouch.Region(game.context.canvas);
		
		var sTouch = new ZingTouch.Tap({
			maxDelay: 1000,
			numInputs: 1,
			tolerance: 100
		});

		var st = this.singleTouch.bind(this);
		this.zt.bind(game.context.canvas, sTouch, st);
		console.log(game.context.canvas);
		

	}

	update(delta) {

		this.parent.scene.cameras.main.centerOn(this.parent.sprite.x, this.parent.sprite.y);

	}

	singleTouch(e) {

		var point = screenSpacetoWorldSpace(this.parent.scene, e.detail.events[0].pageX, e.detail.events[0].pageY);

		if (e.detail.interval < this.presslength) {
			
			this.parent.shootAt(point);

		} else {

			this.parent.moveTo(point);

		}

	}

	swipe(e) {

	}



}

//======================DATA STORAGE CLASSES======================

//A class for storing weapon data.
class Weapon {

	constructor(id, name, firespeed, auto, projectileCount, projectileData) {

		this.id = id;
		this.name = name;
		this.firespeed = firespeed;
		this.auto = auto;
		this.projectileCount = projectileCount;
		this.projectileData = projectileData;

	}

}

//A class for storing projectile data.
class projectileData {

	constructor(speed,damage,type,bounces,drag) {

		this.speed = speed;
		this.damage = damage;
		this.damageType = type;
		this.bounces = bounces;
		this.drag = drag;

	}

}


//======================Actor Extensions======================

class Player extends Actor {

	constructor(id, scene, x, y, rotation, speed, hp, weapon) {

		super(id, scene, "player", x, y, rotation, new TouchController(150, 0.1), speed, hp, weapon);
		

	}

	update(delta) {

		super.update(delta);
		
		

	}

}

//======================Prop Extensions======================

class Target extends Prop {



}