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
		this.sprite = this.scene.Matter.add.image(x, y, sprite);
		this.sprite.rotation = rotation;
		this.controller = controller;
		this.speed = speed;
		this.hp = hp;
		this.weapon = weapon;
		this.path = [];
		this.pathing = false;
		this.stateid = 0;

	}

	create() {

	}

	moveTo(x,y) {

		this.path = this.scene.navMesh.findPath({ x: this.sprite.x, y: this.sprite.y }, { x: x, y: y });
		this.pathing = true;

	}

	dodgeInDirection(rads) {

	}

	shootAt(x,y) {

	}

	moveInDirection(rads, relspeed) {

	}

	lookAt(x,y) {

	}

	moveAlongPath() {



	}

	update(delta) {
		delta /= 1000;
		

		switch (this.stateid) {

			case 0:
				{

					if (this.pathing) {
						this.moveAlongPath();
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
		this.sprite = this.scene.Matter.add.image(x, y, sprite);
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

		super(id, scene, "player", x, y, rotation, new TouchController(0.15,0.1), speed, hp, weapon);

	}

	update() {

		super.update();
		this.scene.cameras.main.centerOn(this.sprite.x, this.sprite.y);

	}

}

//======================Prop Extensions======================