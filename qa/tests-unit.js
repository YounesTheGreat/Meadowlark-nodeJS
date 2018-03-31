var fortune = require("../lib/fortune.js");
var expect = require("chai").expect;

suite("Fortune cookie tests", function(){
	test("getFortune() should return a fortune", function(){
		expect(typeof fortune.getRandomFortune() === "string");
	});
});

// save & run mocha -u tdd -R spec qa/tests-unit.js 
