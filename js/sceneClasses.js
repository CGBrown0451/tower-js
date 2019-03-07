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
		}

	}

	preload() {

		this.load.image('player', 'sprites/Player.png');
		this.load.image('target', 'sprites/Target.png');
		this.load.image('button', 'sprites/button.png');
		this.load.spritesheet('wall', 'sprites/Wall.png', { frameWidth: 32, frameHeight: 32 });

		if (this.level) {

			this.load.tilemapTiledJSON('curLevel', 'maps/' + this.id + ".json");

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
			document.body.requestFullscreen();

		}
		

	}

	update(delta) {
		delta /= 1000;

		if (this.level) {
			var i = 0;
			for (i in this.actors) {

				this.actors[i].update(delta);

			}
		}

	}

};

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



				}
				break;

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