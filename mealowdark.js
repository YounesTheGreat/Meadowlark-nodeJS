/* jshint esversion: 6 */

var express = require("express");

var app = express();

var handlebars = require("express-handlebars").create({
	defaultLayout: "main"
});

var fortune = require("./lib/fortune");

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

app.set("port", process.env.PORT || 3000);

app.disable("x-powered-by"); /* for SECURITY */ 

app.use(express.static(__dirname + "/public"));


app.use(function(req, res, next){
	res.locals.showTests = app.get("env") !== "production" && req.query.test == "1";
	next();				
});

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

// Passing a context to a vue 
app.get("/greeting2", function(req, res){
	res.render("about", {
		message: 'welcome',
		style: req.query.style,
		userId: req.cookie.userId,
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


// Processing Forms
// bodyParser middleware must be linked in
app.post("/process-contact", function(req, res){
	console.log("Retrieved contact from " + req.body.name + '<'+req.body.email+'>');
	// save to database ...
	res.redirect(303, "Thank you");
});
// a more robust approach
app.post("/process-contact2", function(req, res){
	console.log("Retrieved contact from " + req.body.name + '<'+req.body.email+'>');
	try {
		// save to database ..

		return res.xhr ?  res.render({success: true}) : res.redirect(303, "/thank-you");
	} catch (ex) {
		return res.xhr ?
			res.json({error: "database error"}) :
			res.redirect("303", "/database-error");
	}
});



// Providing an API 
var tours = [
	{id: 0, name: "Hood River", price: 99.99},
	{id: 1, name: "Oregon Coast", price: 149.95}
];
/* The term "endpoint" is often used to describe a single function in an API
*/
// Simple GET endpoint returning only JSON
app.get("api/tours", function(req ,res){
	res.json(tours);
});

app.get("/api/tours", function(req, res){
	res.json(tours);
});


// GET endpoint that returns JSON, XML, or text
app.get("/api/tours", function(req, res){
	var toursXml = '<?xml version="1.0"?><tours>'+
		products.map(function(p){
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


// PUT endpoint for updating
app.put("/api/tour/:id", function(req, res){
	var p = tours.some( function(p){ return p.id == req.params.id });
	if (p) {
		if (req.query.name) p.name = req.query.name;
		if (req.query.price) p.price = req.query.price;
		res.json({success: true});
	} else {
		res.json({error: "No such tour exists"});
	}
});


// DEL endpoint
app.del("/api/tour/:id", function(req, res){
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

// 404 catch all handler (middleware)
app.use( function(req, res){
	res.status(404);
	res.render("404");
});

// 500 error handler (middleware)
/* this should appear AFTER all of your routes
note that even if you don't need the "next" function,
it must be included for Express to recognize this as an
error handler
*/
app.use(function(err, req, res, next){
	res.status(500);
	res.render("500");
});




app.listen(app.get("port"), function(){
	console.log("Express started on http://localhost:"+app.get("port")+"; Press Crtl-C to terminate. ");
});

