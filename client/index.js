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

window.PIXI   = require('phaser-ce/build/custom/pixi');
window.p2     = require('phaser-ce/build/custom/p2');
window.Phaser = require('phaser-ce/build/custom/phaser-split');

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
    preload: preload, create: create, update: update
});

function preload() {
    game.load.spritesheet('dude', 'img/sprites.png', 40, 40);
}

function create() {
    game.add.sprite(0, 0, 'dude');
}

function update() {
}
