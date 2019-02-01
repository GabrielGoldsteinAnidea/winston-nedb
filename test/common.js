global.expect = require('chai').expect;
global.rewire = require('rewire');

global.Nedb = require('../src').Nedb;
global.winston = require('winston');
