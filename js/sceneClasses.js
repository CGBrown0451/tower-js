// JavaScript source code
class BaseScene extends Phaser.Scene {

	constructor(id, level) {

		super(id, level);
		this.id = id;
		this.level = level;
		console.log(id + " is loaded.");
		if (this.level) {
			this.actors = [];
			this.props = [];
			this.projectiles = [];
			this.miscobjects = [];
			this.HUD;
			this.Matter = Phaser.Physics.Matter.Matter;
			this.map;
			this.mainLayer;
			this.navMesh;
			this.delta;
			this.uptime;
			this.started = false;
			this.starttime;
			this.gotime;
			this.player;
		}

	}

	preload() {

		this.load.image('player', 'sprites/Player.png');
		this.load.image('target', 'sprites/Target.png');
		this.load.image('button', 'sprites/button.png');
		this.load.image('bullet', 'sprites/bullet.png');
		this.load.spritesheet('wall', 'sprites/Wall.png', { frameWidth: 32, frameHeight: 32 });

		if (this.level) {

			this.load.tilemapTiledJSON('curLevel', 'maps/' + this.id + ".json");

			var col = collisions.bind(this);
			this.matter.world.on('collisionstart', col);

		}

	}

	create() {

		if (this.level) {

			//get the tilemap.
			this.map = this.make.tilemap({ key: 'curLevel' });
			this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

			//Change this bit later; build the level
			var walls = this.map.addTilesetImage('Wall', 'wall');
			this.mainLayer = this.map.createStaticLayer('Walls', walls, 0, 0);
			console.log(this.mainLayer);
			this.mainLayer.setCollisionByProperty({ collides: true });
			this.matter.world.convertTilemapLayer(this.mainLayer);

			//Build the Navmesh.
			var mesh = this.map.getObjectLayer("navMesh");
			this.navMesh = this.navMeshPlugin.buildMeshFromTiled("nav", mesh, 16);

			//spawn objects.
			var obj = initObject.bind(this);
			this.map.filterObjects("Objects", obj);


			//TODO: Make Mobile Device browsers fullscreen.


			
		}
		this.starttime = this.time.now;
		this.HUD = this.scene.scene.scene.get("UIScene");
		
	}

	update() {
		downFrames = clamp(downFrames, 5, 30);
		if (this.level) {
			var i,j,k;
			this.delta = this.time.now - this.uptime;
			this.uptime = this.time.now;
			this.delta /= 1000;

			for (i in this.actors) {

				this.actors[i].update();

			}

			for (j in this.projectiles) {

				this.projectiles[j].update()

			}

			for (k in this.props) {

				this.props[k].update()

			}

			if (this.player.started && !this.started) {

				this.gotime = this.time.now;
				console.log(this.gotime);
				this.started = true;

			}

		}

	}

};

function collisions(event, A, B) {
	if (A.classType == 'proj') {

		if (B.classType != undefined || B.classType != 'proj') {
			this.projectiles[A.classId].DamageBody(B);
		} else {
			this.projectiles[A.classId].bounces += 1;
		}

	} else if (B.classType == 'proj') {

		if (A.classType != undefined || A.classType != 'proj') {
			this.projectiles[B.classId].DamageBody(A);
		} else {
			this.projectiles[B.classId].bounces += 1;
		}
	}

}

function initObject(object) {

	if (object.name == "Spawn") {

		switch (object.properties.type) {

			case "Player":
				{
					this.player = new Player(this.actors.length, this, object.x, object.y, object.rotation, 5, 100, "gun");
					this.actors.push(this.player);
				}
				break;

		}

	} else if (object.name == "Object") {

		switch (object.properties.type) {

			case "Target":
				{

					this.props.push(new Prop(this.props.length, this, object.x, object.y, object.rotation, PROP_TARGET));

				}
				break;

		}

	}

}

class HUD extends Phaser.Scene {

	constructor() {

		super({ key: 'UIScene', active: true });
		this.gamescene;
		this.type;
		this.elements = [];

	}

	initialise(type, scene) {

		this.gamescene = this.scene.get(scene);
		for (var i in this.elements) {

			this.elements[i].textobj.destroy();

		}

		switch (type) {

			case "timerOnly":
				{
					var text1 = new Text(this, 480, 20, "time", 20, 0.5, "#FFFFFF");
					var text2 = new Text(this, 7, 7, "Left: 16", 15, 0, "#FFFFFF");
					this.elements = [text1, text2];
				}
				break;
			case "nothing":
				{
					this.elements = [];
				}
				break;

		}
		

	}

	update() {
		for (var i in this.elements) {

			this.elements[i].update();

		}

	}
}

class startScene extends BaseScene {

	constructor() {

		super("startScene", false);
		this.welcometext = "Hello, and welcome to the TowerJS 0.1 Alpha Test!\nThis is a test that is mainly for touch and mobile devices,\nbut I encourage you to try using a mouse on a computer as well!\nThe Objective is to break all the targets in as little time possible.\nThe controls are simple: press a location for a short amount of time to shoot there.\nPress there a long time to walk there.\nYou can adjust the threshold between the two actions. (The number is in Milliseconds)\nThere is an analytics system in this game. It will only send your time on the\ncourse and your platform of choice. If you are not okay with that, press the analytics button.\nPar time is 40 Seconds, Platinum time is 32, and my best time is about 28.\nHave Fun!"


	}

	preload() {
		super.preload();
	}

	create() {

		new Button('changeScene', 'btTargets', 100, 100, 'button', 'Start!', this);
		new Button('sensUp', 0, 750, 100, 'button', 'Less', this);
		new Button('sensDown', 0, 900, 100, 'button', 'More', this);
		this.analytics = new Button('acceptSubmission', 0, 100, 480, 'button', 'Analytics', this);
		this.sensitivity = new Text(this, 825, 100, downFrames, 20, 0.5, '#FFFFFF', 'center');
		this.maintext = this.add.text(480, 270, this.welcometext, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', align: 'center' });
		this.sens = this.add.text(825, 50, "Threshold", { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', align: 'center' });
		this.maintext.setOrigin(0.5);
		this.sens.setOrigin(0.5);
		this.sensitivity.textobj.setOrigin(0.5);

	}

	update(time, delta) {
		super.update();
		console.log("update");
		this.sensitivity.textobj.setText(Math.floor(downFrames / 60 * 1000).toString());
		if (this.analytics.pressed) {

			this.analytics.text.setText("No Analytics");

		}
		

	}

}

class btTargets extends BaseScene {

	constructor() {
		super("btTargets", true);
		this.mybesttime = 27.922;
		this.partime = 45;
		this.plattime = 32.5;
	
	}

	preload() {

		super.preload();
		this.gametime = 0;
		this.endcardinit = false;
		this.gamestate = 0;
		this.finaltime;
		this.endTime = 5;
		this.endTimer = 0;

	}

	create() {

		super.create();
		this.cameras.main.setBackgroundColor('#666666');
		this.HUD.initialise("timerOnly", this);

	}

	update() {

		switch (this.gamestate) {
			case 0:
				{
					super.update();
					this.gametime = (this.time.now - this.gotime) / 1000;
					if (this.props.length == 0) {

						console.log(this.gametime);
						this.gamestate = 1;
						this.HUD.initialise("nothing", this);
						this.finaltime = this.gametime.toFixed(3);
						break;

					}

					var disptime;
					if (!this.started) {
						disptime = 0.000;
					} else {
						disptime = this.gametime;
					}

					this.HUD.elements[0].text = disptime.toFixed(3).toString();
					this.HUD.elements[1].text = "Left: " + this.props.length;
				}
				break;
			case 1:
				{

					if (!this.endcardinit) {

						var text1 = new Text(this.HUD, 480, 225, "Complete!", 50, 0.5, "#FFFFFF");
						var text2 = new Text(this.HUD, 480, 270, "Time Taken: " + this.finaltime.toString() + " Seconds", 20, 0.5, "#FFFFFF");
						this.HUD.elements.push(text1);
						this.HUD.elements.push(text2);

						var resulttext;

						if (this.finaltime < this.partime) {

							resulttext = "You beat Par Time!";
							

						}

						if (this.finaltime < this.plattime) {

							resulttext = "You beat Platinum Time!";
							

						}

						if (this.finaltime < this.mybesttime) {

							resulttext = "You beat the creator's time!";
							

						}

						var text3 = new Text(this.HUD, 480, 300, resulttext, 20, 0.5, "#FFFFFF");
						this.HUD.elements.push(text3);

						this.endcardinit = true;
						game.scale.stopFullscreen();

					}

					console.log(this.delta);

					if (this.endTimer < this.endTime) {

						this.endTimer += this.delta;

					} else {

						this.scene.scene.scene.start('endScene');
						this.HUD.finaltime = this.finaltime;
						time = this.finaltime;

					}


				}
	}
		
	}

}

class endScene extends BaseScene {

	constructor() {
		super('endScene', false);
		this.welcometext = "You completed the test level!\nThank you for testing my game!\nIf you want to help further, please do the short feedback questionnaire,\nor retry on this or other platforms!";
	}

	preload() {

		super.preload();

	}

	create() {

		super.create();
		this.HUD.initialise("nothing", this);
		this.maintext = this.add.text(480, 270, this.welcometext, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', align: 'center' });
		this.maintext.setOrigin(0.5);
		new Button('link', 'https://goo.gl/forms/310WOCv371YL7mNj2', 400, 490, 'button', 'Feedback', this);
		new Button('restart', 'btTargets', 560, 490, 'button', 'Restart', this);

		if (acceptedSub) {

			gtag('event', 'btTargets', {
				'event_category': 'complete',
				'event_label': navigator.platform,
				'value': time 
			});
			console.log(time.toString() + " " + navigator.platform);
			
		}
							
	}
							
	update() {

	}

}