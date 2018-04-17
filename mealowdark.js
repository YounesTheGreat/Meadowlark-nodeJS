/* jshint esversion: 6 */

var express = require("express");

var app = express();

var fortune = require("./lib/fortune"),
	weather = require("./lib/weather"),
	credentials = require("./credentials.js");

var formidable = require("formidable"); // npm install --save 

var jqupload = require("jquery-file-upload-middleware"); // npm install --save

var handlebars = require("express-handlebars").create({
	defaultLayout: "main",
	helpers: {
		section: function(name, options){
			if (!this._section) this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		}
	}
}); 

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

app.set("port", process.env.PORT || 3000);

app.disable("x-powered-by"); /* for SECURITY */ 

app.use(express.static(__dirname + "/public"));

app.use(require("body-parser")()); // npm install --save body-parser

// CookieParser: npm install --save cookie-parser
app.use(require("cookie-parser")(credentials.cookieSecret));
app.use(require("express-session")());

app.use(function exampleSetCookies(req, res, next){
	res.cookie("monster", "noM nom");
	res.cookie("signed_monster", "nOm NOM", {signed: true});
	next();
});

app.use(function exampleUsingSession(req, res, next){
	req.session.username = "Anonymous";
	var colorScheme = req.session.colorScheme || "dark";
	next();
});

app.use(function exampleDeleteFromSession(req, res, next){
	req.session.username = null; // sets to null but doesn't remove it
	delete req.session.colorScheme; // this removes colorScheme
});

// Using Session to implement Flash Messages
app.use(function(req, res, next){
	// if there's a dlash message, transfer it to the context, then clear it;
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});


// getWeather
app.use(function(req, res, next){
	//if (!res.locals.partials) res.locals.partials = {};
	//res.locals.partials.weather = weather();
	/*res.locals.weather = weather();
	console.log(res.locals.partials.weather);
	console.log(res.locals.weather);*/
	/*console.log("Holaaaa");
	try {
		if (!res.locals.partials) console.log("Not yeeeeet");
		res.locals.partials = {
			weather: weather()
		};

		console.log(res.locals);

		if (!res.locals) console.log("still empty??");
	} catch (e) {
		console.log(e);
	}*/
	res.locals.weather = weather();
	next();
});

// jQuery File Upload p95-96
app.use("/upload", function(req, res, next){
	var now = Date.now();
	jqupload.fileHandler({
		uploadDir: function(){
			return __dirname + '/public/uploads' + now;
		},
		uploadUrl: function(){
			return '/uploads/' + now;
		}
	})(req, res, next);
});


app.use(function(req, res, next){
	res.locals.showTests = app.get("env") !== "production" && req.query.test == "1";
	next();				
});

app.get("/show-cookies", function exampleGetCookies(){
	var monster = req.cookies.monster;
	var signedMonster = req.signedCookies.signed_monster;
	res.send('<a href="/clear-cookies">ClearCookies</a>');
	res.end();
});

app.get("/clear-cookies", function clearMonsterCookie(){
	res.clearCookie("monster");
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

// Some dummy date: products with prices
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

app.post("/process", function(req, res){
	console.log("Form (from querystring): " + req.query.form);
	console.log("CSRF token (from hidden form field): " + req.body._csrf);
	console.log("Name (from visible form field): " + req.body.name);
	console.log("Email (from visible form field): " + req.body.email);

	if (req.xhr || req.accepts("json, html") === "json"){
		res.send({success: true});
	} else {
		res.redirect(303, "/thank-you"); // use 303 (or 302) instead of 301 (see p90)
	}
});

app.get("/contest/vacation-photo", function(req, res){
	var now = new Date();
	res.render("contest/vacation-photo", {
		year: now.getFullYear(), 
		month: now.getMont()
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

app.post("/newsletter", function(req, res){
	var name = req.body.name ||'';
	var email = req.body.email || '';
	// input validation
	if (!email.match(VALID_EMAIL_REGEX)){
		if (req.xhr) return res.json({error: "Invalid name email address"});
		req.session.flash = {
			type: "danger",
			intro: "Validation error!",
			message: "The email address tou entered was not valid"
		};
		return res.redirect(303, "/newsletter/archive");
	}

	/*
	*	Because the flash message is being transeferred from the session
	* to res.locals.flash in our middleware, you have to perform a redirect for
	* the flash message to be displayed. If you want to display a flash message
	* without redirecting, set res.locals.flash instead of req.session.flash
	*/
	new NewsletterSignup({name: name, email: email}).save(function(err){
		if (err){
			if (req.xhr) return res.json({error: "Database"});
			req.session.flash = {
				type: "danger",
				intro: "Database error!",
				message: "There was a database error; please try again later"
			}
			return res.redirect(303, "/newsletter/archive");
		}
		if (req.xhr) return res.json({ success: true });
		req.session.flash = {
			type: "success",
			intro: "Thank you!",
			message: "You have now been signed up for the newsletter"
		};
		return res.redirect(303, "/newsletter/archive");
	});
});



// 404 catch all handler (middleware)
app.use( function(req, res, next){
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
	/*
	*	Liste des routes ( sans middlewares )
	*/
	app._router.stack.forEach(function(r){
		if (r.route){
			//console.log(r.route);
			let path = r.route.path;
			let m = r.route.methods;
			let methods="";
			if (m.get) methods += "GET ";
			if (m.post) methods += "POST";
			console.log(methods+"\t"+path);
		 }
	});
});

