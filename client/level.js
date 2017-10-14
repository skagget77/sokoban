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

const _         = require('lodash');
const Constants = require('./constants.js');

// Transformation from text symbol to world object type.
const symbolTransform = {
    ' ': Constants.FLOOR,
    '$': Constants.FLOOR | Constants.CRATE  << 4,
    '@': Constants.FLOOR | Constants.PLAYER << 4,
    '.': Constants.TARGET,
    '*': Constants.TARGET | Constants.CRATE  << 4,
    '+': Constants.TARGET | Constants.PLAYER << 4,
    '#': Constants.WALL
};

/**
 * Transform a line of text into an array of world objects.
 *
 * @param {string} line Line of text.
 * @return {array<number>} World objects.
 *
 * @throws {string} If an invalid symbol is encountered while
 *     transforming the text.
 */
function transform(line) {
    let objects = [];

    // Find out where the world start inside the text.
    const offset = _.findIndex(line, (symbol) => {
	return symbol != ' ';
    });

    // Text symbols to the left of offset are marked as empty space,
    // symbols to the right are mapped to an object type.
    _.forEach(line, (symbol, index) => {
	if (index < offset) {
	    objects.push(Constants.SPACE);
	}
	else {
	    const type = symbolTransform[symbol];

	    // Invalid symbols are represented by undefined. Raise an
	    // exception to skip the current slice being parsed.
	    if (type == undefined) {
		throw 'invalid symbol "' + symbol + '"';
	    }
	    
	    objects.push(symbolTransform[symbol]);
	}
    });
    
    return objects;
}

/**
 * Creates a new instance of the Level class. Width and height of a
 * level is measured in world objects.
 *
 * @class Level
 * @param {string} name Level name.
 * @param {array<string>} lines Text lines describing the layout of
 *     the level.
 *
 * @property {string} name Name.
 * @property {number} width Width.
 * @property {number} height Height.
 * @property {array<array<number>>} data World objects.
 */
function Level(name, lines) {
    // Get the longest line in the current slice.
    const lineMax = _.maxBy(lines, (line) => {
	return line.length;
    });

    // Object properties.
    this.name   = name;
    this.width  = lineMax.length;
    this.height = lines.length;
    this.data   = [];

    // Transform lines. Trimming potential Windows-style end of line
    // character.
    _.forEach(lines, (line) => {
	this.data.push(transform(_.trimEnd(line)));
    });
}

/**
 * Parse the text into an array of Level objects. The parser expects
 * the text to be in the format used by:
 *
 * http://www.sourcecode.se/sokoban/levels
 *
 * @param {string} text Text.
 * @return {array<Level>} Levels.
 */
exports.parseText = function(text) {
    let levels = [];

    // Split text into lines.
    let lines = _.split(text, '\n');
    let start = 0;
    
    _.forEach(lines, (line, end) => {
	if (_.startsWith(line, ';')) {
	    const name = _.trim(line, '; ');

	    // A level name marks the end of a chunk of lines with
	    // level data. Slice it and turn it into a level object.
	    try {
		levels.push(new Level(name, _.slice(lines, start, end)));
	    }
	    catch(e) {
		console.log('Skipping level "' + name + '", becuase: ' + e);
	    }

	    // Skip level name line.
	    start = end + 1;
	}
    });

    return levels;
};

/**
 * Resets Tilemap and creates a TilemapLayer from the specified level object.
 * Note that the old TilemapLayer need to manually be destroyed.
 *
 * @param {Phaser.Tilemap} tileMap Tilemap.
 * @param {Level} level Level.
 * @return {Phaser.TilemapLayer} Layer.
 */
exports.goToLevel = function(tileMap, level) {
    tileMap.removeAllLayers();

    let layer = tileMap.createBlankLayer(level.name, level.width, level.height,
        Constants.TILE_WIDTH, Constants.TILE_HEIGHT);

    // Transfer level data to tilemap skipping empty space objects.
    _.forEach(level.data, (row, y) => {
	_.forEach(row, (object, x) => {
	    if (object != Constants.SPACE) {
		if (object & 0xF0) {
		    const px = x * Constants.TILE_WIDTH;
		    const py = y * Constants.TILE_HEIGHT;
		    const ot = object >> 4;

		    let sprite = new Phaser.Sprite(
			tileMap.game, px, py, 'spritesheet', ot);
		    layer.addChild(_.merge(sprite, {objectType: ot}));
		}
		
		tileMap.putTile(object & 0x0F, x, y, level.name);
	    }
	});
    });

    return layer;
};
