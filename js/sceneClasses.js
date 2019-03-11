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

		}

	}

};

function collisions(event, A, B) {
	console.log("A collision has happened");
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
					this.actors.push(new Player(this.actors.length, this, object.x, object.y, object.rotation, 5, 100, "gun"));
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
	}

	preload() {

		super.preload();

	}

	create() {

		super.create();

	}

	update() {

		//MainGame loop
		super.update();
		this.cameras.main.setBackgroundColor('#FFFFFF');
		
	}

}