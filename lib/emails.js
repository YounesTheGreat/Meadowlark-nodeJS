module.exports = function(app, mailTransport){

	app.get("/send-email", function showEmailForm(req, res, next){
		res.render("send-email", {layout: null});
	}).post("/send-email", function sendGmail(req, res, next){
		mailTransport.sendMail({
			from: req.body.from || '"Meadowlark Travel" <info@meadowlarktravel.com>',
			to: req.body.to || 'youneskasri@gmail.com',
			subject: req.body.subject || 'Your Meadowlark Travel Tour',
			text: req.body.message || "No message ?"
		}, function(err){
			if (err) console.error("Unable to send email : "+err);
			else {
				console.log("Successfuly sent Email");
				return res.redirect(303, "home");
			}
		});
	}).post("/email-multiple", function sendEmailToMultipleRecipient(req, res, next){
		let mail = {
			from: '"Meadowlark Travel" <info@meadowlarktravel.com>',
			to: 'joe@gmail.com, "Jane Customer" <jane@yahoo.com>, youneskasri@gmail.com',
			subject: 'Your Meadowlark Travel Tour',
			text: 'Thank you for booking your trip with Meadowlark Travel. We look forward to your visit.'
		};
		mailTransport.sendMail(mail, function(err){
			if (err) { console.error("Unable to send email: "+err); res.send("Unable to send email"); }
			else res.status(200).send("Successfuly sent email");
		});
	});
}