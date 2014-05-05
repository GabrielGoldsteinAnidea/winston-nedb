global.expect = require('chai').expect;
global.rewire = require('rewire');


global.Nedb = require('../winston-nedb').Nedb;
global.winston = require('winston');