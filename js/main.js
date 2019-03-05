// JavaScript source code


//DAY 1: Imported required libraries. Made the game scaleable to the screen, with some difficulty. Started making the architecture.
//DAY 2: Making the Architecture. Lots of work done in js/objectClasses.js. Fleshed architecture out. Made a navmesh for the level. Started ZingTouch stuff
var div = document.getElementById("game");

var config = {
	type: Phaser.AUTO,
	parent: "game",
	pixelArt: true,
	scale: {
		/*parent: 'twr',*/
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		zoom: Phaser.Scale.MAX_ZOOM,
		width: 960,
		height: 540
	},
	physics: {

		default: 'matter',
		matter: {
			debug: true,
			gravity: {
				y: 0
			}
		}

	},

	plugins: {
		scene: [
			{ key: "NavMeshPlugin", plugin: PhaserNavMeshPlugin, mapping: "navMeshPlugin", start: true }
		]
	},

	scene: [startScene, btTargets],
	
};

var game = new Phaser.Game(config);
//======================ZingTouch Stuff======================
var zingTouch = ZingTouch.Region(div);


