// JavaScript source code


//DAY 1: Imported required libraries. Made the game scaleable to the screen, with some difficulty. Started making the architecture.
//DAY 2: Making the Architecture. Lots of work done in js/objectClasses.js. Fleshed architecture out. Made a navmesh for the level. Started ZingTouch stuff
//DAY 3: Continued ZingTouch stuff in the touch controller. Now starting to integrate pathfinding and following (the following being the hard part!)
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
//======================Universal Functions======================

function screenSpacetoWorldSpace(scene, x, y) {

	var marginheight = parseInt($(game.context.canvas).css("margin-top").slice(0, -2));
	var marginwidth = parseInt($(game.context.canvas).css("margin-left").slice(0, -2));

	var windowheight = parseInt($(game.context.canvas).css("height").slice(0, -2));
	var windowwidth = parseInt($(game.context.canvas).css("width").slice(0, -2));

	var camerax = ((x - marginwidth) / windowwidth) * 960;
	var cameray = ((y - marginheight) / windowheight) * 540;

	return new Phaser.Geom.Point(scene.cameras.main.scrollX + camerax, scene.cameras.main.scrollY + cameray);

}

function pointtopoint(point1, point2, vec) {

	var point3 = new Phaser.Geom.Point(point2.x - point1.x, point2.y - point1.y);

	if (vec) {

		var magnitude = Phaser.Geom.Point.GetMagnitude(point3);

		point3.x /= magnitude;
		point3.y /= magnitude;

	}

	return point3;

}