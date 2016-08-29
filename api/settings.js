var express = require('express');
var router = express.Router();
var Errors = require('../errors.js');
var settings = require('../models/settings.js');

var validator = require('../paramsValidator.js')({
	blogTitle: 'string',
	blogDescription: 'string',
	commentsModerated: 'boolean',
	commentsMessage: 'string',
	commentsAllowed: 'boolean'
});

router.all('*', function(req, res, next) {
	if(!req.session.loggedIn) {
		res.json({error: Errors.notAuthorised});
	} else {
		next();
	}
});

router.get('/', function(req, res) {
	settings.get(req.app.locals.db, function(err, settingsDoc) {
		if(err) {
			console.log(err);
			res.json({error: Errors.unknown});
		} else {
			res.json(settingsDoc);
		}
	});
});

router.put('/', function(req, res) {
	var params = validator(req.body);

	if(params === null) {
		res.json({error: Errors.invalidParams});
		return;
	}

	settings.put(req.app.locals.db, params, function(err, count, updatedSettings) {
		if(err) {
			console.log(err);
			res.json({error: Errors.unknown});
		} else {
			res.json({success: true});
		}
	});
});

module.exports = router;