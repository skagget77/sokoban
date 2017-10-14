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

const _ = require('lodash');

/**
 * Creates a new instance of the Delay class. Provides non-blocking delay of a
 * specified duration.
 *
 * @param {number} duration Duration of delay in milliseconds.
 */
exports.Delay = function(duration) {
    this.duration = duration;
    this.time     = 0;
};

/**
 * Returns true if the duration of the delay has passed since last call to
 * elapsed, otherwise false.
 *
 * @return {boolean} True if the delay has elapsed, false otherwise.
 */
exports.Delay.prototype.elapsed = function() {
    const now = _.now();
    
    if (now - this.time >= this.duration) {
	this.time = now;
	return true;
    }

    return false;
};

/**
 * Reset the delay.
 */
exports.Delay.prototype.reset = function() {
    this.time = 0;
};
