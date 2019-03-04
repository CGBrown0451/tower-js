// JavaScript source code
class BaseScene extends Phaser.Scene {

	constructor(id, level) {

		super(id, level);
		this.id = id;
		this.level = level;
		console.log(id + " is loaded.");
		this.Matter = Phaser.Physics.Matter.Matter;
		this.map;
		this.mainLayer;

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

			this.map = this.make.tilemap({ key: 'curLevel' });
			this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

			//Change this bit later.
			var walls = this.map.addTilesetImage('Wall', 'wall');
			this.mainLayer = this.map.createStaticLayer('Walls', walls, 0, 0);
			this.mainLayer.setCollision([0]);

		}
		

	}

	update(time, delta) {
		delta /= 1000;
	}

};

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
		console.log(this.mainLayer);
	}

}