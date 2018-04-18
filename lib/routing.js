module.exports = function(app) {
	app.get("/", function(req, res){
		res.render("home");
	});

	app.get("/about", function(req, res){
		res.render("about", {
			fortune: fortune.getRandomFortune(),
			pageTestScript: "/qa/tests-about.js" 
		});
	});

	app.get("/about/contact", (req, res)=>res.send(" About Contacts") );

	app.get("/about*", (req, res)=>res.send(req.route.path));


	app.get("/tours/hood-river", (req, res)=>res.render("tours/hood-river"));

	app.get("/tours/request-group-rate", (req, res)=>res.render("tours/request-group-rate"));


	app.get("/headers", function(req, res){
		res.set('Content-Type', 'text/plain');
		var s = '';
		for (var name in req.headers) s += name + ':' + req.headers[name] + '\n';
		res.send(s);
	});

	// response code other than 200
	app.get("/error", function(req, res){
		res.status(500).render("error");
	});	
}

