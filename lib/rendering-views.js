module.exports = function(app){
	// Passing a context to a vue 
	app.get("/greeting2", function(req, res){
		res.render("about", {
			message: 'welcome',
			style: req.query.style,
			userId: req.cookies.userId,
			username: req.session.username	
		});
	});

	// Rendering a view without a layout
	app.get("/no-layout", function(req, res){
		res.render("no-layout", {layout: null});
	});

	// Renderig a view with a custom layout
	app.get("/custom-layout", function(req, res){
		res.render("custom-layout", {layout: "custom"});
	});

	// Rendering plain text
	app.get("/test", function(req, res){
		res.type("text/plain");
		res.send("this is a test");
	});

	// Some dummy data: products with prices
	app.get("/test-handlebars", function(req, res){
		var contextObject = {
			currency: {
				name: "United States dollars",
				abbrev: "USD",
			},
			tours: [
				{name: "Hood River", price: "$99.95"},
				{name: "Oregon Coast", price: "$159.95"}
			],
			specialsUrl: "/january-specials",
			currencies: ['USD', 'GBP', 'BTC']	
		};

		res.render("home", {
			currency: {
				name: "United States dollars",
				abbrev: "USD",
			},
			tours: [
				{name: "Hood River", price: "$99.95"},
				{name: "Oregon Coast", price: "$159.95"}
			],
			specialsUrl: "/january-specials",
			currencies: ['USD', 'GBP', 'BTC']	
		});
	});


	app.get("/nursery-rhyme", function(req, res){
		res.render("nursery-rhyme");
	});

	app.get("/data/nursery-rhyme", function(req, res){
		res.json({
			animal: "squirrel",
			bodyPart: "tail",
			adjective: "bushy",
			noun: "heck"
		});
	});

	app.get("/newsletter", function(req, res){
		// we will learn about CSRF later.. for now, we just provide a dummy value
		res.render("newsletter", {csrf: "CSRF token goes here"});
	});
}