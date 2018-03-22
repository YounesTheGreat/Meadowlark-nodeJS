var express = require("express");

var app = express();

var handlebars = require("express-handlebars").create({
	defaultLayout: "main"
});


app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");


app.set("port", process.env.PORT || 3000);

app.use(express.static(__dirname + "/public"));



var fortunes = [
	"Conquer your fears or they conquer you",
	"Rivers need springs",
	"Do not fear what you don't know",
	"You will have a pleasant surprise",
	"Whenever possible, keep it simple"
];

function getRandomFortune(){
	var idx = Math.floor(Math.random()*fortunes.length);
	return fortunes[idx];
}


app.get("/", function(req, res){
	res.render("home");
});

app.get("/about", function(req, res){
	res.render("about", {fortune: getRandomFortune()});
});

app.get("/about/contact", (req, res)=>res.send(" About Contacts") );

app.get("/about*", (req, res)=>res.send(req.route.path));


// 404 catch all handler (middleware)
app.use( function(req, res, next){
	res.status(404);
	res.render("404");
});

// 500 error handler (middleware)
app.use( function(err, req, res, next){
	res.status(500);
	res.render("500");
});


app.listen(app.get("port"), function(){
	console.log("Express started on http://localhost:"
		+app.get("port")+"; Press Crtl-C to terminate. ");
});

