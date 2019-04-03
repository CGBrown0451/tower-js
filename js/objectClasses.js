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
		this.text = this.scene.add.text(x, y, text, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', align: 'center' });
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
	if (this.action != 'toggleVibration' && vibration) {
		window.navigator.vibrate(50);
	}
	this.pressed = true;
	switch (this.action) {

		case "log":
			console.log(this.param);
			found = true;
			break;
		case "changeScene":
			curScene = this.param;
			this.scene.scene.get(this.param).prevScene = this.scene.id;
			this.scene.scene.start(this.param);
			found = true;
			break;
		case "restart":
			this.scene.scene.restart(this.param);
			this.scene.scene.start(this.param);
			found = true;
			break;
		case "sensUp":
			downFrames--;
			setCookie("thr", downFrames);
			found = true;
			break;
		case "sensDown":
			downFrames++;
			setCookie("thr", downFrames);
			found = true;
			break;
		case "acceptSubmission":
			acceptedSub = !acceptedSub;
			found = true;
			break;
		case 'link':
			window.open(this.param);
			found = true;
			break;
		case 'toggleVibration':
			vibration = !vibration;
			window.navigator.vibrate(500);
			found = true;
			break;
		case 'toggleFullscreen':
			if (game.scale.isFullscreen) {
				game.scale.stopFullscreen();
			} else {
				game.scale.startFullscreen();
			}
			found = true;
			break;
		case 'gotoOptions':
			this.scene.scene.get('options').prevScene = this.scene.id;
			this.scene.scene.start('options');
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
		this.type = "Text";

	}

	update() {

		this.textobj.setText(this.text);
		this.textobj.setOrigin(this.align);

	}

}

class Crosshair {

	constructor(scene, pointer, sprite, id) {

		this.scene = scene;
		this.pointer = pointer;
		this.id = id;
		this.sprite = this.scene.add.image(pointer.position.x, pointer.position.y, sprite);
		this.type = "Crosshair";
		this.circle = new Phaser.Geom.Circle(this.sprite.x, this.sprite.y, 64);

	}

	update() {

		var graphics = this.scene.graphics;

		this.sprite.x = this.pointer.x;
		this.sprite.y = this.pointer.y;

		//Draw circle meter

		this.circle.x = this.pointer.x;
		this.circle.y = this.pointer.y;

		graphics.lineStyle(5, 0x000000, 1); 
		graphics.strokeCircleShape(this.circle);

		

		graphics.beginPath();

		var arclength = ((this.scene.time.now - this.pointer.downTime) / ((downFrames / 60) * 1000));

		if (arclength > 1) {
			graphics.lineStyle(5, 0xFFFFFF, 1);
		} else {
			graphics.lineStyle(5, 0xFF0000, 1);
		}

		graphics.arc(this.sprite.x, this.sprite.y, 64, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(270 + arclength * 360), false);

		graphics.strokePath();


		if (!this.pointer.isDown) {
			this.destroy();
		}

	}

	destroy() {
		if (this.id < this.scene.elements.length) {
			for (var i = this.id + 1; i < this.scene.elements.length; i++) {
				this.scene.elements[i].id--;

			}
		}
		this.scene.elements.splice(this.id, 1);
		this.sprite.destroy();
		this.pointer.sprited = false;

	}

}

//======================GAME OBJECT CLASSES======================

//Actors are either the player or NPCs. Are controlled by the Controller class. 
class Actor {

	constructor(id, scene, sprite, x, y, rotation, controller, speed, hp, weapon, dodgespeed, dodgetime, slowspeed, factionData) {

		this.id = id;
		this.scene = scene;
		this.type = 'actor';
		this.position = {x: x, y: y};
		this.sprite = this.scene.matter.add.image(x, y, sprite);
		this.sprite.rotation = rotation;
		this.controller = controller;
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
		this.dodgespeed = dodgespeed;
		this.dodgetime = dodgetime;
		this.dodgetimer = 0;
		this.slowspeed = slowspeed;
		this.factionData = factionData;

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
			this.stateid = 0;
			return true;
		} else {

			console.log("path not found");
			return false;
		}

	}

	dodgeInDirection(rads) {
		if (this.stateid == 0) {
			var dir = new Phaser.Math.Vector2(Math.cos(rads), Math.sin(rads))
			console.log(dir);
			this.sprite.setVelocity(dir.x * this.dodgespeed, dir.y * this.dodgespeed);
			this.stateid = 1;
			this.dodgetimer = 0;
		}

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

	stopPath() {
		this.path = [];
		this.pathing = false;
	}

	update(delta) {
		this.sprite.body.object = this;
		this.position = new Phaser.Geom.Point(this.sprite.x, this.sprite.y);
		
		this.controller.update();
		switch (this.stateid) {

			case 0:
				{
					this.sprite.setAngularVelocity(0);
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
						

					}

				}
			break;

			case 1:
				{
					console.log(this.dodgetime);
					if (this.dodgetimer < this.dodgetime) {
						this.dodgetimer += this.scene.delta;
						this.sprite.setVelocity(this.sprite.body.velocity.x * (1 - this.slowspeed), this.sprite.body.velocity.y * (1 - this.slowspeed));

					} else {

						this.sprite.setVelocity(0, 0);
						this.stateid = 0;
						this.dodgetimer = 0;

					}

				}
				break;

			case 2:
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
		this.sprite.body.object = this;
		this.sprite.rotation = rotation;
		this.maxhp = this.data.hp;
		this.hp = this.maxhp;
		this.sprite.setMass(this.data.mass);

		if (this.data.immovable) {
			this.sprite.setStatic(true);
		}
		

	}

	destroy() {
		if (this.id < this.scene.props.length) {
			for (var i = this.id + 1; i != this.scene.props.length; i++) {
				this.scene.props[i].id--;
				this.scene.props[i].sprite.body.classId--;

			}
		}
		this.scene.props.splice(this.id, 1);
		this.sprite.destroy();

	}

	update() {

		if (this.hp <= 0) {
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
		this.sprite.body.object = this;
		this.data = projectileData;
		this.bounces = 0;
		this.sprite.rotation = rotation;
		this.sprite.setBounce(1);
		this.sprite.body.restitution = 0.9;
		this.sprite.body.frictionAir = 0.002;
		var vel = angleToVector(false, this.sprite.rotation).scale(this.data.speed);
		this.sprite.setVelocity(vel.x, vel.y);
	}

	update() {
		
		if (this.sprite.body.speed < 5) {

			this.destroy();

		}

	}


	DamageBody(body) {

		body.object.hp -= this.data.damage;
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

	constructor(presslength, swipesens, parent) {

		this.presslength = presslength;
		this.swipesens = swipesens;
		this.parent = parent;
		this.stRegister = false;
		this.ltRegister = false;
		this.lookmode = false;
		this.touchProperties;

		var td = this.touchDown.bind(this);
		this.parent.scene.input.on("pointerdown", td);

		var tu = this.touchUp.bind(this);
		this.parent.scene.input.on("pointerup", tu);
		

	}

	update(delta) {
		if (!this.lookmode) {
			this.parent.scene.cameras.main.centerOn(this.parent.sprite.x, this.parent.sprite.y);
		}

		for (var i in this.parent.scene.input.manager.pointers) {

			var p = this.parent.scene.input.manager.pointers[i];
			if (p.isDown && p.actionable) {

				if (this.parent.scene.time.now - p.downTime > this.presslength) {
					window.navigator.vibrate(50);
					this.parent.moveTo(new Phaser.Geom.Point(p.worldX, p.worldY));
					p.actionable = false;
				}
			}



		}


	}

	touchDown(p, over) {
		p.actionable = true;
		window.navigator.vibrate(20);
	}

	touchUp(p, over) {
		if (p.actionable) {

			if (hypotenuse({ x: p.getDistanceX(), y: p.getDistanceY() }) > this.swipesens * this.parent.scene.cameras.main.width) {
				this.parent.dodgeInDirection(p.angle);
				p.actionable = false;
				window.navigator.vibrate([50, 30, 25, 20, 12, 8, 6, 4, 3, 2, 1]);
			} else if (this.parent.scene.time.now - p.downTime < this.presslength) {
				this.parent.shootAt(new Phaser.Geom.Point(p.worldX, p.worldY));
				p.actionable = false;
				
				window.navigator.vibrate([50, 20, 20]);
				
			}

		}
	}

}

class EnemyBrain {

	constructor(parent,path) {

		this.parent = parent;
		this.enemies = [];
		this.lastseen = [];
		this.inView = [];
		this.amtinView = 0;
		this.engaging = null;
		this.stateid = 0;
		this.timer = [0,0,0,0,0];
		this.time = [0,0,0,0,0];
		this.pathindex = 0;
		this.patrolpath = path.split(",");
		for (var i in this.patrolpath) {
			this.patrolpath[i] = Number(this.patrolpath[i]);
		}
		var len = this.patrolpath.length / 2;
		console.log(len);
		for (var j = 0; j < len; j++) {

			var vec = { x: this.patrolpath[j], y: this.patrolpath[j + 1]}
			this.patrolpath[j] = vec;
			this.patrolpath.splice(j+1, 1);
			console.log(this.patrolpath);

		}

	}

	update() {

		this.objectsSeen = lineofSight(this.parent, this.parent.sprite.angle, 45, 300, this.parent.scene.actors, this.parent.scene);
		for (var i in this.objectsSeen) {
			var obj = this.objectsSeen[i];
			if (!this.enemies.includes(obj)) {
				for (var j in this.parent.factionData.enemyfactions) {

					if (obj.factionData.friendlyfactions.includes(this.parent.factionData.enemyfactions[j])) {

						this.enemies.push(obj);

					}

				}
			}

		}

		for (var j in this.enemies) {
			var obj = this.enemies[j];
			if (this.objectsSeen.includes(obj)) {
				this.lastseen[j] = obj.position;
				if (!this.inView[j]) {
					this.amtinView++;
				}
				this.inView[j] = true;
			} else {
				if (this.inView[j]) {
					this.amtinView--;
				}
				this.inView[j] = false;
			}
		}

		if (this.amtinView == 0) {
			var e = [];
			var lowest = 0; 
			for (var i in this.lastseen) {
				var d = dist(this.parent.position, this.lastseen[i]);
				e.push(d);
				if (lowest == 0) {
					lowest = d;
				} else if (lowest > d) {
					lowest = d;
				}

			}
			for (var j in e) {
				if (lowest == e[j]) {
					this.engaging = j;
					break;
				}
			}
		} else {

			for (i in this.inView) {
				if (this.inView[i] = true) {
					this.engaging = i;
					break;
				}
			}

		}

		var eObject = this.enemies[this.engaging];
		var eView = this.inView[this.engaging];
		var eSeen = this.lastseen[this.engaging];

		switch (this.stateid) {

			case 0:
				{
					//Patrol
					this.time[0] = 2;
					if (this.parent.pathing) {

					} else {
						this.timer[0] += this.parent.scene.delta;
						if (this.timer[0] > this.time[0]) {
							this.pathindex++;
							if (this.pathindex == this.patrolpath.length) {
								this.pathindex = 0;
							}
							this.parent.moveTo(this.patrolpath[this.pathindex]);
							this.timer[0] = 0;
						}
					}
					if (this.engaging != null) {

						this.stateid = 1;
						this.parent.stopPath();
						this.timer[0] = 0;

					}
				}
				break;
			case 1:
				{
					//Seen
					this.parent.stopPath();
					this.time[0] = 0.5;
					this.timer[0] += this.parent.scene.delta;
					this.parent.lookAt(eSeen);
					if (this.timer[0] > this.time[0]) {
						if (eView) {
							this.stateid = 2;
						} else {
							this.stateid = 3;
						}
						this.timer[0] = 0;
					}

				}
				break;
			case 2:
				{
					//Combat
					this.time[0] = 2;
					this.time[1] = 1;
					this.timer[0] += this.parent.scene.delta;
					this.timer[1] += this.parent.scene.delta;
					if (this.timer[0] > this.time[0]) {
						this.time[0] = randomRange(1.5, 2.5);
						this.timer[0] = 0;
						this.parent.moveTo({ x: this.parent.position.x + randomRange(-20, 20), y: this.parent.position.y + randomRange(-20, 20) });
						this.parent.lookAt(eSeen);
					}

					if (this.timer[1] > this.time[1]) {
						this.time[1] = randomRange(0.5, 1.5);
						this.timer[1] = 0;
						this.parent.shootAt(eSeen);
					}

					if (!eView) {
						this.stateid = 3;
						this.timer[0] = 0;
						this.timer[1] = 0;
					} else {
						this.parent.lookAt(eSeen);
					}

				}
				break;
			case 3:
				{
					//Chase
					this.time[0] = 2;
					console.log(this.timer[1]);
					if (this.parent.pathing) {
						this.parent.lookAt(eSeen);
					} else {
						if (this.timer[1] < 1) {
							this.parent.moveTo(eSeen);
							this.timer[1] = 1;
						} else {
							this.timer[0] += this.parent.scene.delta;
							if (this.timer[0] > this.time[0]) {
								this.stateid = 4;
								this.timer[1] = 0;
								this.timer[0] = 0;
							}
						}
					}

					if (eView) {

						this.timer[1] = 0;
						this.timer[0] = 0;
						this.parent.stopPath();
						this.stateid = 2;

					}

				}
				break;
			case 4:
				{
					//Lookfor
					this.time[0] = 2;
					if (!this.parent.pathing) {
						this.timer[0] += this.parent.scene.delta;
						if (this.timer[0] > this.time[0]) {
							if (this.parent.moveTo({ x: this.parent.position.x + randomRange(-200, 200), y: this.parent.position.y + randomRange(-200, 200) })) {
								this.timer[0] = 0;
							}
						}
					}

					if (eView) {
						this.timer[0] = 0;
						this.stateid = 2;
						this.parent.stopPath();
					}

				}
		}
		if (isNaN(this.timer[0])) {
			this.timer[0] = 0;
		}

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

class factionData {

	constructor(friendlyfactions, enemyfactions) {

		this.friendlyfactions = friendlyfactions;
		this.enemyfactions = enemyfactions; 

	}

}


//======================Actor Extensions======================

class Player extends Actor {

	constructor(id, scene, x, y, rotation, speed, hp, weapon, dodgespeed, dodgetime, slowspeed) {

		super(id, scene, "player", x, y, rotation, null, speed, hp, weapon, dodgespeed, dodgetime, slowspeed, FACT_PLAYER);
		this.controller = new TouchController((downFrames / 60) * 1000, 0.1, this);
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

class Grunt extends Actor {

	constructor(id, scene, x, y, rotation, speed, hp, weapon, dodgespeed, dodgetime, slowspeed, patrolpath) {

		super(id, scene, "player", x, y, rotation, null, speed, hp, weapon, dodgespeed, dodgetime, slowspeed, FACT_GUARD);
		this.controller = new EnemyBrain(this, patrolpath);
		this.sprite.setCircle(8);

	}

	update(delta) {
		super.update();


	}

}

//======================Prop Extensions======================

