var express = require('express');
var User = require('../../models/user.js');
var Errors = require('../../errors.js');

var router = express.Router();

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
})

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