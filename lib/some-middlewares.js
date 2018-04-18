module.exports = function(app, credentials, express, weather){
	app.use(require("body-parser").urlencoded({extended: false}));

	// CookieParser: npm install --save cookie-parser
	app.use(require("cookie-parser")(credentials.cookieSecret));
	app.use(require("express-session")());


	// Chapter 10 - middlewares
	app.use(function(req, res, next){
		console.log("Processing request for "+ req.url +"...");
		req.finirChaineMiddlewares = false;
		next();
	}).use(function(req, res, next){
		if (req.finirChaineMiddlewares == false) return next();
		console.log("terminating request");
		res.send("thanks for playing ! Fin de la chaine de middleware :)) ");
		// note that we do NOT call next() here.. => this terminates the request
	}).use(function(req, res, next){
		if (req.finirChaineMiddlewares == false) return next();
		console.log("Whoops, i'll never get called !");
	});


	app.use(function getWeather(req, res, next){
		res.locals.weather = weather();
		next();
	});
}