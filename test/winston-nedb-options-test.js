

describe("check passing options to Nedb",function(){
  function filenameInitialization() {
    return new (winston.Logger)({
	    transports: [
	      		new Nedb({filename: './tmp/test.db'})
	    	]
	  	});
  }
	it("initializes an instance at the given filename location",function(done){
    expect(filenameInitialization).to.not.throw(ReferenceError, /fileanme is not defined/);
    done();
  });

})
