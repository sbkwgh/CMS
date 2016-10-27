var express = require('express');
var User = require('../../models/user.js');
var Errors = require('../../errors.js');
var paramsValidator = require('../../paramsValidator.js');

var router = express.Router();

var updateValidator = paramsValidator({
	biography: 'string',
	author: 'string'
});

router.post('/', function(req, res) {
	User.findOne({}, function(err, user) {
		if(err) {
			console.log(err);
			res.json({error: Errors.unknown});
			return;
		}

		if(user) {
			res.json({error: Errors.accountAlreadyCreated});
		} else {
			var user = new User({
				username: req.body.username,
				hash: req.body.password,
				author: req.body.author
			});

			user.save(function(err, success) {
				if(err) {
					console.log(err);
					res.json({error: Errors.unknown});
				} else {
					req.session.loggedIn = true;
					req.session.author = user.author;
					req.session._id = user._id;

					res.cookie('author', req.body.author);

					res.json({success: true})
				}
			})
		}
	})
});
router.post('/:username', function(req, res) {
	User.findUserAndCompareHashes(req.params.username, req.body.password, function(err, verified, user) {
		if(err) {
			if(err === 'user not found') {
				res.json({error: Errors.incorrectCredentials});
			} else {
				console.log(err);
				res.json({error: Errors.unknown});
			}
			return;
		} else if(verified) {
			req.session.loggedIn = true;
			req.session.author = user.author;
			req.session._id = user._id;

			res.cookie('author', user.author);

			res.json({success: true});
		} else {
			res.json({success: false, error: Errors.incorrectCredentials});
		}
	})
});

router.all('*', function(req, res, next) {
	if(!req.session.loggedIn) {
		res.json({error: Errors.notAuthorised});
	} else {
		next();
	}
});

router.get('/', function(req, res) {
	User.findOne({_id: req.session._id}, function(err, user) {
		if(err) {
			console.log(err)
			res.json({error: Errors.unknown});
		} else {
			var JSONUser = user.toJSON({virtuals: true});
			res.json(JSONUser);
		}
	});
});

router.put('/', function(req, res) {
	var params = updateValidator(req.body);

	if(!params) {
		res.json({error: Errors.invalidParams});
	} else {
		User.updateAndSetAuthorId(req.session._id, params, function(err) {
			if(err) {
				console.log(err)
				res.json({error: Errors.unknown});
			} else {
				res.json({success: true});
			}
		});
	}
});

router.delete('/:username', function(req, res) {
	var username = req.params.username;
	
	User.findOne({username: username}, function(err, user) {
		if(err) {
			console.log(err)
			res.json({error: Errors.unknown});
		} else {
			user.remove(function(err) {
				if(err) {
					console.log(err);
					res.json({error: Errors.unknown});
				} else 
				res.json({success: true});
			});
		}
	});
});

module.exports = router;