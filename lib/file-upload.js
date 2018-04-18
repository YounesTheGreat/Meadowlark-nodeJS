module.exports = function(app, formidable) {
	app.get("/contest/vacation-photo", function(req, res){
		var now = new Date();
		res.render("contest/vacation-photo", {
			year: now.getFullYear(), 
			month: now.getMonth()
		});
	});

	app.post("/contest/vacation-photo/:year/:month", function(req ,res){
		var form = new formidable.IncomingForm();
		form.parse(req, function(err, fields, files){
			if (err) return res.redirect(303, "/error");
			console.log("received fields:");
			console.log(files);
			res.redirect(303, "/thank-you");
		});
	});

	app.get("/thank-you", (req, res)=>res.send("Thank you a sat"));
}