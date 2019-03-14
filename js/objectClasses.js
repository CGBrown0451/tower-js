// JavaScript source code

//======================FRINGE OBJECT CLASSES======================
class Button{

	constructor(action, param, x, y, sprite, text, scene) {

		this.action = action;
		this.param = param;
		this.x = x;
		this.y = y;
		this.scene = scene;
		this.button = this.scene.add.sprite(x, y, sprite).setInteractive();
		this.text = this.scene.add.text(x, y + 40, text, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', align: 'center' });
		this.text.setOrigin(0.5);
		this.pressed = false;

		var func = press.bind(this);
		this.button.on('pointerdown', func);
	}
};

function press() {


	//this is based on the type of button you've made.

	//make a change scene_button.
	var found = false;
	window.navigator.vibrate(50);
	this.pressed = true;
	switch (this.action) {

		case "log":
			console.log(this.param);
			found = true;
			break;
		case "changeScene":
			this.scene.scene.start(this.param);
			game.context.canvas.requestFullscreen();
			curScene = this.param;
			found = true;
			break;
		case "restart":
			location.reload();
			found = true;
			break;
		case "sensUp":
			downFrames--;
			found = true;
			break;
		case "sensDown":
			downFrames++;
			found = true;
			break;
		case "acceptSubmission":
			acceptedSub = false;
			found = true;
			break;
		case 'link':
			window.open(this.param);
			found = true;
			break;
			
	}
	if (!found) {
		console.error("No such function as " + this.action);
	}
}

class Text {

	constructor(scene, x, y, text, size, origin, color, align) {

		this.scene = scene;
		this.textobj = this.scene.add.text(x, y, text, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', fontSize: size.toString() + "px", color: color, align: align });
		this.align = origin;
		this.text = text;
	}

	update() {

		this.textobj.setText(this.text);
		this.textobj.setOrigin(this.align);

	}

}

//======================GAME OBJECT CLASSES======================

//Actors are either the player or NPCs. Are controlled by the Controller class. 
class Actor {

	constructor(id, scene, sprite, x, y, rotation, controller, speed, hp, weapon) {

		this.id = id;
		this.scene = scene;
		this.type = 'actor';
		this.position;
		this.sprite = this.scene.matter.add.image(x, y, sprite);
		this.sprite.body.classType = this.type;
		this.sprite.body.classId = this.id;
		this.sprite.rotation = rotation;
		this.controller = controller;
		this.controller.parent = this;
		this.speed = speed;
		this.maxhp = hp;
		this.hp = hp;
		this.weapon = weapon;
		this.path = [];
		this.pathing = false;
		this.aiming = false;
		this.focuspoint;
		this.aimtime = 3;
		this.aimtimer = 0;
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

		this.lookAt(point);

		var angle = angleToVector(false, this.sprite.rotation);
		angle.scale(this.sprite.width / 2);

		if (!this.started) {

			this.started = true;

		}

		var position = new Phaser.Math.Vector2(angle.x + this.sprite.x, angle.y + this.sprite.y);

		this.scene.projectiles.push(new Projectile(this.scene.projectiles.length, this.scene, 'bullet', position.x, position.y, this.sprite.rotation, PROJ_PISTOLBULLET));

	}

	moveInDirection(degs, relspeed) {



	}

	lookAt(point) {

		var dir = pointtopoint(this.position, point, true);
		this.sprite.rotation = Phaser.Math.Angle.Between(0, 0, dir.x, dir.y);

		this.focuspoint = point;
		this.aiming = true;
		this.aimtimer = 0;

	}

	moveAlongPath(delta) {

		var nextpoint = this.path[0];
		var dist = pointtopoint(this.position, nextpoint, false);
		var dir = new Phaser.Math.Vector2(dist);
		dir.normalize();
		dist = new Phaser.Math.Vector2(dist);
		if (dist.length() < this.speed) {

			this.path.shift();
			this.sprite.x = nextpoint.x;
			this.sprite.y = nextpoint.y;
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
		this.position = new Phaser.Geom.Point(this.sprite.x, this.sprite.y);
		this.controller.update();
		switch (this.stateid) {

			case 0:
				{
					if (this.scene.delta != NaN) {
						this.aimtimer = this.aimtimer + this.scene.delta;
					}
					
					if (this.aimtimer > this.aimtime) {

						this.aiming = false;
						this.aimtimer = 0;
						
					}

					if (this.pathing) {
						this.moveAlongPath(delta);

						if (!this.aiming) {
							if (this.sprite.body.speed > 0) {
								var angle = Phaser.Math.Angle.Between(0, 0, this.sprite.body.velocity.x, this.sprite.body.velocity.y);
								this.sprite.rotation = angle;
							}
						} else {

							var dir = pointtopoint(this.position, this.focuspoint, true);
							var angle = Phaser.Math.Angle.Between(0, 0, dir.x, dir.y);
							this.sprite.rotation = angle;

						}
					} else {

						this.sprite.setVelocity(0, 0);
						this.sprite.setAngularVelocity(0);

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
		if (this.id < this.scene.actors.length) {
			for (var i = this.id + 1; i != this.scene.actors.length; i++) {
				this.scene.actors[i].id--;
				this.scene.actors[i].sprite.body.classId--;

			}
		}
		this.scene.actors.splice(this.id, 1);
		this.sprite.destroy();

	}

}

//Props are chairs, tables, potted plants, or anything that generally doesn't interact with the player.
class Prop{

	constructor(id, scene, x, y, rotation, data) {

		this.id = id;
		this.type = 'prop';
		this.data = data;
		this.scene = scene;
		this.sprite = this.scene.matter.add.image(x, y, this.data.sprite);
		if (this.data.circle) {
			this.sprite.setCircle(this.sprite.width / 2);
		}
		this.sprite.body.classType = this.type;
		this.sprite.body.classId = this.id;
		this.sprite.rotation = rotation;
		this.maxhp = this.data.hp;
		this.hp = this.maxhp;
		this.sprite.setMass(this.data.mass);

		if (this.data.immovable) {
			this.sprite.setStatic(true);
		}
		

	}

	destroy() {
		console.log(this.id);
		if (this.id < this.scene.props.length) {
			for (var i = this.id + 1; i != this.scene.props.length; i++) {
				console.log(i);
				this.scene.props[i].id--;
				this.scene.props[i].sprite.body.classId--;

			}
		}
		this.scene.props.splice(this.id, 1);
		this.sprite.destroy();

	}

	update() {

		if (this.hp <= 0) {
			console.log("Destroy prop" + this.id);
			this.destroy();

		}

	}

}


//Projectiles are things that fly through the air and hit stuff, and apply damage to them.
class Projectile{

	constructor(id, scene, sprite, x, y, rotation, projectileData) {

		this.id = id;
		this.type = 'proj';
		this.scene = scene;
		this.sprite = this.scene.matter.add.image(x, y, sprite);
		this.sprite.setCircle(5);
		this.sprite.body.classType = this.type;
		this.sprite.body.classId = this.id;
		this.data = projectileData;
		this.bounces = 0;
		this.sprite.rotation = rotation;
		this.sprite.setBounce(1);
		this.sprite.body.restitution = 0.9;
		this.sprite.body.frictionAir = 0.002;
		var vel = angleToVector(false, this.sprite.rotation).scale(this.data.speed);
		this.sprite.setVelocity(vel.x, vel.y);
		console.log(this);
	}

	update() {
		
		if (this.sprite.body.speed < 5) {

			this.destroy();

		}

	}


	DamageBody(body) {

		var object;

		if (body.classType == 'actor') {

			object = this.scene.actors[body.classId];

		}

		if (body.classType == 'prop') {

			object = this.scene.props[body.classId];

		}

		if (object == undefined) {
			return;
		}

		object.hp -= this.data.damage;
		this.destroy();

	}

	destroy() {
		if (this.id < this.scene.projectiles.length) {
			for (var i = this.id + 1; i != this.scene.projectiles.length; i++) {
				this.scene.projectiles[i].id--;
				this.scene.projectiles[i].sprite.body.classId--;

			}
		}
		this.scene.projectiles.splice(this.id, 1);
		this.sprite.destroy();

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

		var sSwipe = new ZingTouch.Swipe({
			escapeVelocity: 0.5
		});

		var ss = this.swipe.bind(this);
		this.zt.bind(game.context.canvas, sSwipe, ss);

		
		

	}

	update(delta) {

		this.parent.scene.cameras.main.centerOn(this.parent.sprite.x, this.parent.sprite.y);

	}

	singleTouch(e) {

		var point = screenSpacetoWorldSpace(this.parent.scene, e.detail.events[0].pageX, e.detail.events[0].pageY);
		
		if (e.detail.interval < this.presslength) {
			
			this.parent.shootAt(point);
			window.navigator.vibrate([50,20,10]);

		} else {

			this.parent.moveTo(point);
			window.navigator.vibrate(50);

		}

	}

	swipe(e) {

		this.parent.dodgeInDirection(e.detail.currentDirection);
		//window.navigator.vibrate([50, 10, 20, 10, 10, 5, 5, 5, 5, 5, 5]);

	}

}

//======================DATA STORAGE CLASSES======================

//A class for storing weapon data.
class Weapon {

	constructor(id, name, firespeed, auto, inacc, projectileCount, projectileData) {

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

	constructor(speed,damage,type,bounces,drag,inacc) {

		this.speed = speed;
		this.damage = damage;
		this.damageType = type;
		this.bounces = bounces;
		this.drag = drag;
		this.inaccuracy = inacc;

	}

}

class propData {

	constructor(sprite, mass, hp, immovable, circle) {

		this.sprite = sprite;
		this.mass = mass;
		this.hp = hp;
		this.immovable = immovable;
		this.circle = circle;

	}

}


//======================Actor Extensions======================

class Player extends Actor {

	constructor(id, scene, x, y, rotation, speed, hp, weapon) {

		super(id, scene, "player", x, y, rotation, new TouchController((downFrames / 60) * 1000, 0.1), speed, hp, weapon);
		this.sprite.setCircle(8);
		this.start = new Phaser.Math.Vector2(x, y);
		this.started = false;

	}

	update(delta) {

		super.update(delta);

		if (!this.started) {

			if (Phaser.Math.Fuzzy.Equal(this.start.x, this.sprite.x, 5)) {

				if (Phaser.Math.Fuzzy.Equal(this.start.y, this.sprite.y, 5)) {



				} else {

					this.started = true;

				}

			} else {

				this.started = true;

			}
		}

	}

}

//======================Prop Extensions======================

