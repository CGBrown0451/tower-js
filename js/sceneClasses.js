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
	}

	update() {
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
	console.log(this.props);

}

class HUD extends Phaser.Scene {

	constructor() {

		super({ key: 'UIScene', active: false });
		this.scene;
		this.type;
		this.elements = [];

	}

	initialise(type, scene) {

		this.scene = scene;
		this.active = true;
		switch (type) {

			case "timerOnly":
				{
					var text1 = "text";
					this.elements = [text1];
					break;
				}

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
		this.btn1;

	}

	preload() {
		super.preload();
	}

	create() {

		this.btn1 = new Button('changeScene','btTargets',200,200,'button',this);

	}

	update(time, delta) {
		super.update();

	}

}

class btTargets extends BaseScene {

	constructor() {
		super("btTargets", true);
		this.gamestate = 0;
		this.mybesttime = 28.36740000010468;
		this.partime = 50;
		this.platttime = 35;
		this.gametime = 0;
	}

	preload() {

		super.preload();

	}

	create() {

		super.create();
		this.cameras.main.setBackgroundColor('#666666');
	}

	update() {

		switch (this.gamestate) {
			case 0:
				{
					super.update();
					if (this.props.length == 0) {

						this.gametime = (this.time.now - this.gotime) / 1000;
						console.log(this.gametime);
						this.gamestate = 1;

					}
				}
				break;
			case 1:
				{
					console.log("COMPLETE!");
					var achieve = false;
					if (this.gametime < this.partime) {

						if (this.gametime < this.platttime) {
							achieve = true;
							console.log("You beat platinum!");
							
						}

						if (this.gametime < this.mybesttime) {

							console.log("You beat me!");

						}

						if (!achieve) {
							console.log("You got Par!");
						}

					}

				}
	}
		
	}

}