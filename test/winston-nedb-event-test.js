var expect = require('chai').expect;
var rewire = require('rewire');


var Nedb = require('../winston-nedb').Nedb;
var winston = require('winston');


describe("check querying behaviour",function(){
	before(function(){

	})
	beforeEach(function(){
		this.logger = new (winston.Logger)({
	    transports: [
	      		new Nedb()
	    	]
	  	});
	});
	it("trigger \"logging\" event when it got a log line",function(done){
		this.logger.on("logging",function(transport,level,msg,meta){
			expect(msg).to.equal("1log");
			expect(level).to.equal("info");
			expect(transport instanceof Nedb).to.be.true;
			done();
		})

	  	this.logger.log('info', '1log');
	})
})