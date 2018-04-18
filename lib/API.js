module.exports = function(app){
	// Providing an API 
	var tours = [
		{id: 0, name: "Hood River", price: 99.99},
		{id: 1, name: "Oregon Coast", price: 149.95}
	];
	/* The term "endpoint" is often used to describe a single function in an API
	*/
	// Simple GET endpoint returning only JSON
	app.get("api/tours", function(req ,res, next){
		//res.json(tours);
		return next();
	});


	// GET endpoint that returns JSON, XML, or text
	app.get("/api/tours", function(req, res){
		var toursXml = '<?xml version="1.0"?><tours>'+
			tours.map(function(p){
				return '<tour price="'+p.price+'" id="'+p.id+'">' + p.name + '</tour>';
			}).join('') + '</tours>';
		var toursText = tours.map(function(p){
			return p.id+": "+p.name+" ("+p.price+")";
		}).join('\n');

		res.format({
			"application/json": function(){
				res.json(tours);
			},
			"text/xml": function(){
				res.type("text/xml");
				res.send(toursXml);
			},
			"text/plain": function(){
				res.type("text/plain");
				res.send(toursXml);
			}
		});
	});

	app.get("/api/tour/:id", function(req, res){
		var tour = tours.find( function getYourById(tour){ return tour.id == req.params.id; });
		if (!tour) return res.json("Not found");
		res.json(tour);
	});

	// PUT endpoint for updating
	app.put("/api/tour/:id", function(req, res){
		var p = tours.some( function(p){ return p.id == req.params.id; });
		if (p) {
			if (req.query.name) p.name = req.query.name;
			if (req.query.price) p.price = req.query.price;
			res.json({success: true});
		} else {
			res.json({error: "No such tour exists"});
		}
	});

	// DELETE endpoint
	app.delete("/api/tour/:id", function(req, res){
		var i;
		for(var i=tours.length-1; i>=0; i--)
			if (tours[i].id == req.params.id) break;

		if (i>=0) {
			tours.splice(i, 1);
			res.json({success: true});
		} else {
			res.json({error: "No such tour exists"});
		}
	});	
}
