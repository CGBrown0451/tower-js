// JavaScript source code
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

class Actor extends Phaser.sprite {

	constructor(id, controller, speed, hp, weapon) {

		this.id = id;
		this.controller = controller;
		this.speed = speed;
		this.hp = hp;
		this.weapon = weapon;

	}

	create() {

	}

	moveTo(x,y) {

	}

	dodgeInDirection(rads) {

	}

	shootAt(x,y) {

	}

	moveInDirection(rads, relspeed) {

	}

	lookAt(x,y) {

	}

	update() {

	}

	destroy() {

	}

}

class Prop extends Phaser.sprite {

	constructor(id, hp, weight) {

		this.id = id;
		this.hp = hp;
		this.weight = weight;

	}

}

class Projectile extends Phaser.sprite {

	constructor(id, speed, damage) {

		this.id = id;
		this.speed = speed;
		this.damage = damage;

	}

}