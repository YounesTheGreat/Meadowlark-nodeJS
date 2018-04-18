module.exports = function(app){
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

	/* NOT TESTED YET */
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
}