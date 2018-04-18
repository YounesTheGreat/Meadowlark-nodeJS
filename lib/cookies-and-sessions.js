module.exports = function(app){
	
		app.use(function exampleSetCookies(req, res, next){
		res.cookie("userId", "testuserid");
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
		next();
	});

	// Using Session to implement Flash Messages
	app.use(function(req, res, next){
		// if there's a dlash message, transfer it to the context, then clear it;
		res.locals.flash = req.session.flash;
		delete req.session.flash;
		next();
	});

	app.get("/show-cookies", function exampleGetCookies(req, res){
		var monster = req.cookies.monster;
		var signedMonster = req.signedCookies.signed_monster;

		var message = 'cookie monster = ' + monster + ' cookie signedMonster = '+signedMonster + 'userId '+ req.cookies.userId;
		message += '<a href="/clear-cookies">ClearCookies</a>'
		res.send(message);
		// no need to call next(), this will terminate the request
	});

	app.get("/clear-cookies", function clearMonsterCookie(req ,res){
		res.clearCookie("monster");
		res.clearCookie("signed_monster");
		return res.redirect(303, "/show-cookies");
	});	

};