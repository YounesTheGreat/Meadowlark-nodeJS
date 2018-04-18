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
	}).get("/email-multiple", function sendEmailToMultipleRecipient(req, res, next){
		
		// ... an array of email addresses
		let largeRecipientList = [
			"youneskasri@gmail.com",
			"email@example.com",
			"hola@example.fr"];

		/* when sending email to multiple recipients, you must be careful
		about the limit of your MSA, for example, Gmail limits the number
		of recipients to 100 per email */	
		let recipientLimit = 100;
		
		for(let i=0, n = largeRecipientList.length/recipientLimit ; i<=n; i++){
			let mail = {
				from: '"Meadowlark Travel" <info@meadowlarktravel.com>',
				to: largeRecipientList.slice(i*recipientLimit, (i+1)*recipientLimit).join(','),
				subject: 'Special price on Hood River Special travel package',
				text: 'Thank you for booking your trip with Meadowlark Travel. We look forward to your visit.'
			};
			mailTransport.sendMail(mail, function(err){
				if (err) { console.error("Unable to send email: "+err); res.send("Unable to send email"); }
				else res.status(200).send("Successfuly sent email");
			});
		} // end For
	}); // end Get
}