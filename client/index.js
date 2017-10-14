/*
 * Sokoban, a web version of the classic Sokoban puzzle game.
 * Copyright (C) 2017  Johan Andersson
 *
 * This file is part of Sokoban.
 *
 * Sokoban is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Sokoban is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Sokoban.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// Phaser expects 3 global variables to exist.
window.PIXI   = require('phaser-ce/build/custom/pixi');
window.p2     = require('phaser-ce/build/custom/p2');
window.Phaser = require('phaser-ce/build/custom/phaser-split');

const _         = require('lodash');
const Constants = require('./constants.js');
const Level     = require('./level.js');
const Util      = require('./util.js');

var tileMap = null;
var layer = null;
var levels = null;
var levelIndex = 0;
var player = null;
var crates = null;

// Input delays.
var delay = {
    pointer:  new Util.Delay(100),
    keyboard: new Util.Delay(150),
    special:  new Util.Delay(150)
};

/**
 * Checks whether an object at position (x, y) would collide with one of the
 * wall tiles.
 *
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @return {boolean} True if there would be a collision, false otherwise.
 */
function collisionWithWall(x, y) {
    const tx = layer.getTileX(x);
    const ty = layer.getTileY(y);
 
    return layer.map.getTile(tx, ty).index == Constants.WALL;
}

/**
 * Checks whether an object at position (x, y) would collide with one of the
 * crate sprites.
 *
 * @param {number} x X coordiate.
 * @param {number} y Y coordinate.
 * @return {boolean} The crate that the object would collide with, otherwise
 *     null.
 */
function collisionWithCrate(x, y) {
    return _.find(crates, (crate) => {
	return crate.getBounds().contains(x, y);
    });
}

/**
 * Returns the movement direction as indicated by touch input or the mouse.
 *
 * @return {object} Movement direction.
 */
function directionFromPointer() {
    const pointer = game.input.activePointer;
    
    if (pointer.isDown) {
	if (delay.pointer.elapsed()) {
	    const x = layer.getTileX(pointer.x) - layer.getTileX(player.x);
	    const y = layer.getTileY(pointer.y) - layer.getTileY(player.y);

	    // Determine intended movement direction and also scales x and y to
	    // unit values.
	    const ax = Math.abs(x);
	    const ay = Math.abs(y);

	    if (ax > ay) {
		return { x: (x != 0) ? x / ax : 0, y: 0 };
	    }

	    if (ax < ay) {
		return { x: 0, y: (y != 0) ? y / ay : 0 };
	    }
	}
    }
    else {
	delay.pointer.reset();
    }
    
    // Pointer not down or at a 45 degree angle.
    return null;
}

/**
 * Returns the movement direction as indicated by the keyboard.
 *
 * @return {object} Movement direction.
 */
function directionFromKeyboard() {
    const keyboard = game.input.keyboard;

    // Determine whether any of the keys are being pressed.
    const left  = keyboard.isDown(Phaser.KeyCode.LEFT);
    const right = keyboard.isDown(Phaser.KeyCode.RIGHT);
    const up    = keyboard.isDown(Phaser.KeyCode.UP);
    const down  = keyboard.isDown(Phaser.KeyCode.DOWN);

    if (left || right || up || down) {
	if (delay.keyboard.elapsed()) {
	    if (left) {
		return { x: -1, y: 0 };
	    }

	    if (right) {
		return { x: 1, y: 0 };
	    }

	    if (up) {
		return { x: 0, y: -1 };
	    }

	    if (down) {
		return { x: 0, y: 1 };
	    }    
	}
    }
    else {
	delay.keyboard.reset();
    }

    // No button pressed.
    return null;
}

/**
 * Move the player sprite one tile in the specified direction. Any crate sprite
 * in front of the player not being blocked by another crate or a wall will be
 * pushed one tile.
 *
 * @param {object} direction Movement direction.
 */
function moveTo(direction) {
    const px = direction.x * Constants.TILE_WIDTH;
    const py = direction.y * Constants.TILE_HEIGHT;

    // First tile in front of player.
    const x1 = player.x + px;
    const y1 = player.y + py;

    if (collisionWithWall(x1, y1)) {
	return;
    }

    // Second tile in front of player.
    const x2 = x1 + px;
    const y2 = y1 + py;

    // Crates can move, but we have to check what is on the tile behind the
    // crate.
    let crate = collisionWithCrate(x1, y1);

    if (crate != null) {
	if (collisionWithWall(x2, y2) || collisionWithCrate(x2, y2) != null) {
	    return;
	}
	
	crate.x += px;
	crate.y += py;
    }
    
    player.x += px;
    player.y += py;
}

/**
 * Destroy the active level and load the level with the specified index.
 *
 * @param {number} index Level index.
 */
function goToLevel(index) {
    if (layer != null) {
	layer.destroy();
    }

    // Load level data into a new layer.
    layer = Level.goToLevel(tileMap, levels[index]);

    player = _.find(layer.children, (child) => {
	return child.objectType == Constants.PLAYER;
    });

    crates = _.filter(layer.children, (child) => {
	return child.objectType == Constants.CRATE;
    });
}

/**
 * Handle any special key being pressed, such as resetting the active level.
 */
function handleSpecialKeys() {
    const keyboard = game.input.keyboard;

    // Determine whether any of the keys are being pressed.
    const prev  = keyboard.isDown(Phaser.KeyCode.P);
    const next  = keyboard.isDown(Phaser.KeyCode.N);
    const reset = keyboard.isDown(Phaser.KeyCode.R);

    if (prev || next || reset) {
	if (delay.special.elapsed()) {
	    if (prev && levelIndex > 0) {
		levelIndex--;
	    }

	    if (next && levelIndex < levels.length - 1) {
		levelIndex++;
	    }

	    // For reset the index is already correct.
	    goToLevel(levelIndex);
	}
    }
    else {
	delay.special.reset();
    }
}

function preload() {
    game.load.spritesheet('spritesheet', 'assets/spritesheet.png', 32, 32);
    game.load.text('levels', 'assets/zone_26.txt');
}

function create() {
    levels = Level.parseText(game.cache.getText('levels'));

    const width = _.maxBy(levels, (level) => {
	return level.width;
    });

    const height = _.maxBy(levels, (level) => {
	return level.height;
    });
    
    tileMap = game.add.tilemap();
    tileMap.addTilesetImage('spritesheet', 'spritesheet', Constants.TILE_WIDTH, Constants.TILE_HEIGHT);
    var l = tileMap.create('default', width, height, Constants.TILE_WIDTH, Constants.TILE_HEIGHT);
    l.resizeWorld();

    goToLevel(levelIndex);
}

/**
 * Phaser's game update loop. Called roughly every 16:th millisecond.
 */
function update() {
    handleSpecialKeys();
    
    if (player != null) {
	let direction = directionFromPointer();

	if (direction != null) {
	    moveTo(direction);
	}
	
	direction = directionFromKeyboard();

	if (direction != null) {
	    moveTo(direction);
	}
    }
}

// Game.
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'sokoban', {
    preload: preload, create: create, update: update
});
