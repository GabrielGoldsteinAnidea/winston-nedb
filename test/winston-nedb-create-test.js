var expect = require('chai').expect;
var rewire = require('rewire');


var Nedb = require('../winston-nedb').Nedb;
var winston = require('winston');


describe("make winston log into nedb",function(){
	before(function(){

	})
	beforeEach(function(){
		this.logger = new (winston.Logger)({
	    transports: [
	      		new Nedb()
	    	]
	  	});
	});
	it("log a line successfully with default options",function(done){
		this.logger.log('info', 'Hello World');
		this.logger.query({},function(err,res){
			expect(res).to.have.property("nedb");
			expect(res.nedb).to.have.property("length").above(0);
			expect(res.nedb[0]).to.have.property("msg","Hello World");
			done();
		});
	})
})