// JavaScript source code
class BaseScene extends Phaser.Scene {

	constructor(id, level) {

		super(id, level);
		this.id = id;
		this.level = level;
		console.log(id + " is loaded.");

	}

	preload() {

		this.load.image('player', 'sprites/Player.png');
		this.load.image('target', 'sprites/Target.png');
		this.load.image('button', 'sprites/button.png');
		this.load.image('bullet', 'sprites/bullet.png');
		this.load.image('logo', 'sprites/towerlogo.png');
		this.load.image('crosshair', 'sprites/Crosshair.png');
		this.load.spritesheet('wall', 'sprites/Wall.png', { frameWidth: 32, frameHeight: 32 });

		if (this.level) {

			this.load.tilemapTiledJSON('curLevel', 'maps/' + this.id + ".json");

			var col = collisions.bind(this);
			this.matter.world.on('collisionstart', col);

		}

	}

	create() {
		this.HUD = this.scene.scene.scene.get("UIScene");
		if (this.level) {
			console.log("reee");
			//Declare the main variables
			this.actors = [];
			this.props = [];
			this.projectiles = [];
			this.miscobjects = [];
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
			this.gametime = 0;
			this.endcardinit = false;
			this.gamestate = 0;
			this.finaltime;
			this.endTime = 5;
			this.endTimer = 0;

			for (var i in this.input.manager.pointers) {

				var p = this.input.manager.pointers[i];
				p.actionable = false;
				p.sprited = false;

			}
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
		}
		this.starttime = this.time.now;
		
		
	}

	update() {
		downFrames = clamp(downFrames, 5, 30);
		if (this.level) {
			var i,j,k;
			this.delta = this.time.now - this.uptime;
			this.uptime = this.time.now;
			this.delta /= 1000;
			switch (this.gamestate) {
				case 0:
					{
						this.gametime = (this.time.now - this.gotime) / 1000;

						for (i in this.actors) {

							this.actors[i].update();

						}

						for (j in this.projectiles) {

							this.projectiles[j].update();

						}

						for (k in this.props) {

							this.props[k].update();

						}

						if (this.player.started && !this.started) {

							this.gotime = this.time.now;
							console.log(this.gotime);
							this.started = true;

						}
						
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

							if (this.finaltime < this.bronzetime) {

								resulttext = "You Got Bronze!";


							}

							if (this.finaltime < this.silvertime) {

								resulttext = "You Got Silver!";


							}

							if (this.finaltime < this.goldtime) {

								resulttext = "You Got Gold!";


							}

							if (this.finaltime < this.mybesttime) {

								resulttext = "You beat my time!";


							}

							var text3 = new Text(this.HUD, 480, 300, resulttext, 20, 0.5, "#FFFFFF");
							this.HUD.elements.push(text3);

							this.endcardinit = true;


						}

						if (this.endTimer < this.endTime) {

							this.endTimer += this.delta;

						} else {

							this.HUD.finaltime = this.finaltime;
							time = this.finaltime;
							this.scene.scene.scene.start('endScene');


						}


					}
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
	console.log(object.name + " " + object.type);
	if (object.name == "Spawn") {

		switch (object.type) {

			case "Player":
				{
					this.player = new Player(this.actors.length, this, object.x, object.y, object.rotation, 5, 100, "gun", 7, 1, 0.02);
					this.actors.push(this.player);
					console.log(this.player);
				}
				break;

		}

	} else if (object.name == "Object") {

		switch (object.type) {

			case "Target":
				{

					this.props.push(new Prop(this.props.length, this, object.x, object.y, object.rotation, PROP_TARGET));

				}
				break;

			case "Ranks":
				{
					var text = "Ranks:\nBronze: " + this.bronzetime + "\nSilver: " + this.silvertime + "\nGold: " + this.goldtime + "\nCreator: " + this.mybesttime;
					var txt = this.add.text(object.x, object.y, text, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', align: 'center' });
					txt.setOrigin(0.5);
					console.log(txt);

				}
				break;

			case "Text":
				{

					var txt = this.add.text(object.x, object.y, object.properties.text, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', align: 'center' });
					txt.setOrigin(0.5);

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
		this.initialised = false;


	}

	create() {

		this.graphics = this.add.graphics();

	}

	initialise(type, scene) {

		this.gamescene = this.scene.get(scene);
		for (var i in this.elements) {
			switch (this.elements[i].type) {
				case "Text":
					{
						this.elements[i].textobj.destroy();
					}
					break;
				case "Crosshair":
					{
						this.elements[i].sprite.destroy();
					}
					break;
			}
		}

		switch (type) {

			case "timerOnly":
				{
					var text1 = new Text(this, 480, 20, "time", 20, 0.5, "#FFFFFF");
					var text2 = new Text(this, 7, 7, "Left: 16", 15, 0, "#FFFFFF");
					this.elements = [text1, text2];
					this.initialised = true;
				}
				break;
			case "nothing":
				{
					this.elements = [];
					this.initialised = true;
				}
				break;

		}
		

	}

	update() {
		this.graphics.clear();
		if (this.initialised) {
			for (var i in this.elements) {

				this.elements[i].update();

			}

			if (this.gamescene.level) {
				for (var i in this.scene.scene.input.manager.pointers) {

					var p = this.scene.scene.input.manager.pointers[i];
					if (p.actionable && !p.sprited) {

						this.elements.push(new Crosshair(this, p, 'crosshair', this.elements.length));
						p.sprited = true;
						

					}
					

				}
				
			}
		}

	}
}

class startScene extends BaseScene {

	constructor() {

		super("startScene", false);
		this.welcometext = "Controls:\nPress to Shoot.\nHold to walk.\nSwipe to Lunge."


	}

	preload() {
		super.preload();
	}

	create() {
		super.create();
		this.add.image(480, 50, 'logo');
		new Button('changeScene', 'btTargets', 480, 270, 'button', 'Start!', this);
		new Button('gotoOptions', 'options', 480, 400, 'button', 'Options', this);
		this.fs = new Button('toggleFullscreen', '', 880, 500, 'button', 'Go Fullscreen', this);
		this.maintext = this.add.text(100, 400, this.welcometext, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', align: 'center' });

	}

	update(time, delta) {
		super.update();

		if (game.scale.isFullscreen) {
			this.fs.text.setText("Go Windowed");
		} else {
			this.fs.text.setText("Go Fullscreen");
		}

	}

}

class Options extends BaseScene {

	constructor() {

		super('options', false);


	}

	preload() {
		super.preload();
	}

	create() {

		new Button('sensUp', 0, 400, 200, 'button', 'Less', this);
		new Button('sensDown', 0, 560, 200, 'button', 'More', this);
		this.back = new Button('changeScene', this.prevScene, 70, 40, 'button', 'Back', this);
		this.analytics = new Button('acceptSubmission', 0, 560, 450, 'button', 'Analytics', this);
		this.sensitivity = new Text(this, 480, 200, downFrames, 20, 0.5, '#FFFFFF', 'center');
		this.sens = this.add.text(480, 150, "Threshold", { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', align: 'center' });
		this.sens.setOrigin(0.5);
		this.sensitivity.textobj.setOrigin(0.5);
		this.fs = new Button('toggleFullscreen', '', 400, 450, 'button', 'Go Fullscreen', this);

	}

	update() {

		this.sensitivity.textobj.setText(Math.floor(downFrames / 60 * 1000).toString());
		if (acceptedSub) {
			this.analytics.text.setText("Analytics");
		} else {
			this.analytics.text.setText("No Analytics");
		}

		if (game.scale.isFullscreen) {
			this.fs.text.setText("Go Windowed");
		} else {
			this.fs.text.setText("Go Fullscreen");
		}

		this.back.param = this.prevScene;

	}

}

class btTargets extends BaseScene {

	constructor() {
		super("btTargets", true);
		this.failtime = 70;
		this.bronzetime = 50;
		this.silvertime = 40;
		this.goldtime = 32.5;
		this.mybesttime = 27.922;
	
	}

	preload() {

		super.preload();

	}

	create() {

		super.create();
		this.cameras.main.setBackgroundColor('#666666');
		this.HUD.initialise("timerOnly", this);
		

	}

	update() {

		super.update();

		if (this.gamestate == 0) {

			if (this.props.length == 0) {

				console.log(this.gametime);
				this.gamestate = 1;
				this.HUD.initialise("nothing", this);
				this.finaltime = this.gametime.toFixed(3);
				return;

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
		new Button('gotoOptions', '', 480, 400, 'button', 'Options', this);

		if (acceptedSub) {

			gtag('event', 'complete', {
				'event_category': navigator.platform,
				'event_label': time.toString(),
			});
			console.log(time.toString() + " " + navigator.platform);
			
		}
							
	}
							
	update() {

	}

}