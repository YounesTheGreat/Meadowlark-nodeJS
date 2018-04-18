/* jshint esversion: 6 */
const express = require("express");
const app = express();
const fortune = require("./lib/fortune"),
	weather = require("./lib/weather"),
	credentials = require("./credentials.js");

const formidable = require("formidable");
const jqupload = require("jquery-file-upload-middleware"); // npm install --save
const handlebars = require("express-handlebars").create({
	defaultLayout: "main",
	helpers: { // didn't work ?
		section: function(name, options){
			if (!this._section) this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		}
	}
}); 

const nodemailer = require("nodemailer");
const crypto = require("./lib/crypto");
let mailTransport = nodemailer.createTransport(
	crypto.decrypt(credentials.gmail.url));


app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");
app.set("port", process.env.PORT || 3000);
app.disable("x-powered-by"); /* for SECURITY */ 
app.use(express.static(__dirname + "/public"));


/* Setting some middlewares : body-parser, cookie-parser, 
express-session and some of my own : weather ...*/
require("./lib/some-middlewares")(app, credentials, express, weather);


// Playing with Cookies and Sessions
require("./lib/cookies-and-sessions")(app);


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

// Page tests
app.use(function(req, res, next){
	res.locals.showTests = app.get("env") !== "production" && req.query.test == "1";
	next();				
});

// Sending Email
require("./lib/emails")(app, mailTransport);

// Some Routing
require("./lib/routing")(app);

// Passing context to a view, Rendering views with Handlebars
require("./lib/rendering-views")(app);

// Processing Forms
require("./lib/processing-forms")(app);

/** API */
require("./lib/API")(app);


/* File upload with Formidable */
require("./lib/file-upload")(app, formidable);


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
	res.render("500", {error: err});
});



/* Listen + affiche liste des routes (sans middlawares) */
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

