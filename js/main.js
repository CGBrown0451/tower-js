// JavaScript source code
//DAY 1 (Mon 1): Imported required libraries. Made the game scaleable to the screen, with some difficulty. Started making the architecture. Made some quick sprites.
//DAY 2 (Tue 1): Making the Architecture. Lots of work done in js/objectClasses.js. Fleshed architecture out. Made a navmesh for the level. Started ZingTouch stuff
//DAY 3 (Wed 1): Continued ZingTouch stuff in the touch controller. Now starting to integrate pathfinding and following (the following being the hard part!)
//DAY 4 (Thu 1): Pathing and collision implemented, with relative difficulty. Experimented with vibration, adding it to the movement actions to add tactile feedback, tuned movement to be more like the GML version, made angleToVector
//DAY 5 (Fri 1): Shooting is now implemented. Tried adding inaccuracy, and it broke. Made a bullet sprite.

//DAY 6 (Mon 2): Planning on making the targets and collision detection with bullets. Did that.
//DAY 7 (Tue 2): Starting work on scripting the level and making HUD, Tweaked and increased collision functionality to make it less buggy, and more precise, level scripted, HUD needs looking into.
//DAY 8 (Wed 3): HUD works now. It displays your time in seconds and milliseconds when playing. Level scripting and flow is done.
//DAY 9 (Thu 2): Menus Finished. Game should be finished now.
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
			debug: false,
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

	scene: [startScene, btTargets, HUD, endScene],
	
};

var game = new Phaser.Game(config);
console.log(game);
var curScene;
var downFrames = 15;
var time;
var acceptedSub = true;
console.log(navigator);
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

function angleToVector(degs, rot) {

	if (degs) {

		rot = rot * Math.PI / 180;

	}

	return new Phaser.Math.Vector2(Math.cos(rot), Math.sin(rot));

}

function randomRange(low, high) {

	return Math.floor(Math.random() * (high - low) + low);

}

function clamp(number, min, max) {

	if (min > max) {

		console.error("Min is more than Max!");
		return NaN;

	}

	if (number > max) {

		number = max;

	}

	if (number < min) {

		number = min;

	}

	return number;

}