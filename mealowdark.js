var express = require("express");

var app = express();

var handlebars = require("express-handlebars").create({
	defaultLayout: "main"
});

var fortune = require("./lib/fortune");

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");


app.set("port", process.env.PORT || 3000);


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

// 404 catch all handler (middleware)
app.use( function(req, res){
	res.status(404);
	res.render("404");
});

// 500 error handler (middleware)
app.use( function(err, req, res, next){
	res.status(500);
	res.render("500");
});


app.listen(app.get("port"), function(){
	console.log("Express started on http://localhost:"+app.get("port")+"; Press Crtl-C to terminate. ");
});

