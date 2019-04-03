// JavaScript source code

//Projectile Data
let PROJ_PISTOLBULLET = new projectileData(10, 10, 'bullet', 2, 0.05, 5 * Phaser.Math.DEG_TO_RAD);

//Prop Data
let PROP_TARGET = new propData('target', 20, 1, true, true);

//Faction Data
let FACT_PLAYER = new factionData(["Player"], ["Guard"]);
let FACT_GUARD = new factionData(["Guard"], ["Player"]);