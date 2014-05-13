describe("check log rotation over time",function(){
	var tk = require('timekeeper');
	var time = new Date(1330688329321);
	var diff = 1000000000;
	var time2 = new Date(1330688500000);

	var logger={};
	var db = new Nedb();
	before(function(){
		logger = new (winston.Logger)({
	    transports: [
	    	db  		
	    	]
	  	});
		tk.freeze(time);
	  	logger.log('info', 'old log');
	  	tk.freeze(time2);
	  	logger.log("info","new log");
	})
	beforeEach(function(){
		
	});
	it("trigger \"logging\" event when it got a log line",function(done){
		tk.travel(time2);
		db.rotate(80,function(err,numRemoved){
			expect(err).to.be.null;
			expect(numRemoved).to.equal(1);
			done();
		})
	})
})