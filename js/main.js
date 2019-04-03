// JavaScript source code
//DAY 1 (Mon 1): Imported required libraries. Made the game scaleable to the screen, with some difficulty. Started making the architecture. Made some quick sprites.
//DAY 2 (Tue 1): Making the Architecture. Lots of work done in js/objectClasses.js. Fleshed architecture out. Made a navmesh for the level. Started ZingTouch stuff
//DAY 3 (Wed 1): Continued ZingTouch stuff in the touch controller. Now starting to integrate pathfinding and following (the following being the hard part!)
//DAY 4 (Thu 1): Pathing and collision implemented, with relative difficulty. Experimented with vibration, adding it to the movement actions to add tactile feedback, tuned movement to be more like the GML version, made angleToVector
//DAY 5 (Fri 1): Shooting is now implemented. Tried adding inaccuracy, and it broke. Made a bullet sprite.

//DAY 6 (Mon 2): Planning on making the targets and collision detection with bullets. Did that.
//DAY 7 (Tue 2): Starting work on scripting the level and making HUD, Tweaked and increased collision functionality to make it less buggy, and more precise, level scripted, HUD needs looking into.
//DAY 8 (Wed 2): HUD works now. It displays your time in seconds and milliseconds when playing. Level scripting and flow is done.
//DAY 9 (Thu 2): Menus Finished. Google Analytics Implemented. Game should be finished now.
//DAY 10 (Fri 2): Small misc touch ups and bugfixes.

//DAY 11 (Mon 3): Tightened up the movement system, removing Zingtouch integration in the process. Added dodging. 
//DAY 12 (Tue 3): Made it so you can restart a scene. Added Vibration to the revised control scheme.
//DAY 13 (Wed 3): Completely Revised UI. Made a new button image to facilitate smaller touchscreens.
//DAY 14 (Thu 3): Added a dynamic crosshair. Reworked btTargets a bit.
//DAY 15 (Fri 3): Finished the Dynamic Crosshair. Made a level select screen and started on implementing Cookies into the game.

//DAY 16 (Mon 4): Started with a line of sight script. Hit a wall. May have to do it manually. In the meantime, I made another level and made slight tweaks to accommodate it. Adding new levels should be super easy now.
//DAY 17 (Tue 4): Continued with trying to do a line of sight script. Redid the bullet collision system. Made a test level to accommodate the new AI I am making.
//Day 18 (Wed 4): After getting a bit of help, my line of sight code is completely functional. Enemy AI is also completely functional.
var div = document.getElementById("game");

var config = {
	type: Phaser.WEBGL,
	parent: "game",
	pixelArt: true,
	input: {
		activePointers: 5
	},
	scale: {
		/*parent: 'twr',*/
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
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

	scene: [startScene, levelSelect, Options, Tutorial, btTargets, TestScene, HUD, endScene],
	
};

var game = new Phaser.Game(config);
console.log(game);
var curScene;
var downFrames = 15;
if (getCookie("thr") != "") {
	downFrames = Number(getCookie("thr"));
}
var time, nr;
var acceptedSub = true;
var vibration = true;
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

function dist(point1, point2) {

	var dist = pointtopoint(point1, point2, false);

	return hypotenuse(dist);

}

function hypotenuse(point) {

	return Math.abs(Math.sqrt(point.x * point.x + point.y * point.y));

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

function lineofSight(seer, angle, fov, range, finds, scene) {

	var seen = [];

	fov = fov * Phaser.Math.DEG_TO_RAD;

	for (var i in finds) {

		if (finds[i] == seer) {
			continue;
		}

		if (dist(seer.position, finds[i].position) > range) {
			continue;
		}

		var lookVec = angleToVector(true, angle);
		var relVec = pointtopoint(seer.position, finds[i].position, true);

		var dot = new Phaser.Math.Vector2(lookVec).dot(new Phaser.Math.Vector2(relVec));

		var angle = Math.acos(dot);

		if (dot < fov) {
			continue;
		}

		var rayend = { x: seer.position.x + (relVec.x * range), y: seer.position.y + (relVec.y * range) };
		var check = scene.matter.world.localWorld.bodies.slice();
		for (j in check) {
			if (check[j].object.type == 'proj') {

				check.splice(j, 1);

			}
		}

		var objects = Phaser.Physics.Matter.Matter.Query.ray(check, seer.position, rayend);

		objects.sort(function (a, b) {
			a = dist(seer.position, a.bodyA.position);
			b = dist(seer.position, b.bodyA.position);
			return a - b;
		});

		if (objects[1].bodyA.object == finds[i]) {
			seen.push(finds[i]);
		}

	}

	return seen;

}

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function setCookie(cname, prop) {

	var cookie = cname + "=" + prop;
	document.cookie = cookie;
}