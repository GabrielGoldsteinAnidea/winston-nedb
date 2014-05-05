

describe("check querying behaviour",function(){
	before(function(){

	})
	beforeEach(function(){
		this.logger = new (winston.Logger)({
	    transports: [
	      		new Nedb()
	    	]
	  	});
	  	this.logger.log('info', '1log');
		this.logger.log('info', '2log');
		this.logger.log('info', '3log');
	});
	it("default-query winston for full list of ascending order sorted logs",function(done){
		this.logger.query({order:'asc'},function(err,res){
			expect(res).to.have.property("nedb");
			expect(res.nedb).to.have.property("length").above(0);
			expect(res.nedb[0]).to.have.property("msg","1log");
			expect(res.nedb[2]).to.have.property("msg","3log");
			done();
		});
	})

	it("query logs in descending order",function(done){

		this.logger.query({order:'desc'},function(err,res){
			expect(res).to.have.property("nedb");
			expect(res.nedb).to.have.property("length").above(0);
			expect(res.nedb[2]).to.have.property("msg","1log");
			expect(res.nedb[0]).to.have.property("msg","3log");
			done();
		});
	})

	it("query logs with a limit",function(done){

		this.logger.query({limit:2},function(err,res){
			expect(res).to.have.property("nedb");
			expect(res.nedb).to.have.property("length").above(0);
			expect(res.nedb).to.have.property("length").below(3);
			done();
		});
	})
	it("query logs skipping first 2 lines",function(done){

		this.logger.query({order:'asc',start:2},function(err,res){
			expect(res).to.have.property("nedb");
			expect(res.nedb).to.have.property("length").above(0);
			expect(res.nedb).to.have.property("length").below(2);
			expect(res.nedb[0]).to.have.property("msg","3log");
			done();
		});
	})
})