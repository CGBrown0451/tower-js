// JavaScript source code
var config = {
	type: Phaser.AUTO,
	pixelArt: true,

	scale: {
		parent: 'twr',
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

	scene: [startScene, btTargets],

};

var game = new Phaser.Game(config);

