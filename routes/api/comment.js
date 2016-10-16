var express = require('express');
var mongoose = require('mongoose');
var Comment = require('../../models/comment.js');
var Post = require('../../models/post.js');
var settings = require('../../models/settings.js');
var Errors = require('../../errors.js');
var paramsValidator = require('../../paramsValidator.js');
var router = express.Router();

var validator = paramsValidator({
	commentBody: {type: 'string', required: true},
	name: {type: 'string', required: true},
	dateCreated: 'string',
	postId: 'string',
	head: 'string',
	replies: 'string',
	repliesName: 'string'
});

router.get('/', function(req, res) {
	Comment.find({}, function(err, comments) {
		if(err) {
			console.log(err);
			res.json({error: Errors.unknown});
		} else {
			if(req.session.loggedIn) {
				res.json(comments);
			} else {
				res.json(comments.map(function(comment) {
					if(comment.status === 'pending' || comment.status === 'removed') {
						comment.commentBody = '';
						comment.name = '';
					}

					return comment;
				}));
			}
			
		}
	});
});

router.get('/:id', function(req, res) {
	settings.get(req.app.locals.db, function(err, settingsDoc) {
		if(!settingsDoc.commentsAllowed) {
			res.json({error: Errors.commentsDisabled});
			return;
		} else {
			Post.findOne({_id: mongoose.Types.ObjectId(req.params.id)}, function(err, post) {
				if(err) {
					console.log(err);
					res.json({error: Errors.unknown});
				} else if(!post.commentsAllowed) {
					res.json({error: Errors.commentsDisabled});
				} else {	
					Comment.find({postId: req.params.id}, function(err, comments) {
						if(err) {
							console.log(err);
							res.json({error: Errors.unknown});
						} else {
							if(req.session.loggedIn) {
								res.json(comments);
							} else {
								res.json(comments.map(function(comment) {
									if(comment.status === 'pending' || comment.status === 'removed') {
										comment.commentBody = '';
										comment.name = '';
									}

									return comment;
								}));
							}
							
						}
					});
				}
			});
		}
	});
	
});


router.post('/', function(req, res) {
	var commentParams = validator(req.body);

	if(commentParams === null) {
		res.json({error: Errors.invalidParams});
		return;
	} else if(req.session.loggedIn) {
		commentParams.author = true;
	}
	
	settings.get(req.app.locals.db, function(err, settingsDoc) {
		var commentsModerated = settingsDoc.commentsModerated;

		if(!settingsDoc.commentsAllowed) {
			res.json({error: Errors.commentsDisabled});
			return;
		}

		Post.findOne({_id: commentParams.postId}, function(err, post) {
			if(err) {
				console.log(err);
				res.json({error: Errors.unknown});
			} else if(!post) {
				res.json({error: Errors.invalidParams});
			} else if(!post.commentsAllowed) {
				res.json({error: Errors.commentsDisabled});
			} else {
				if(commentsModerated && !req.session.loggedIn) {
					commentParams.status = 'pending';
				} else {
					commentParams.status = 'approved';
				}
				commentParams.postTitle = post.title;
				var comment = new Comment(commentParams);

				comment.save(function(err, savedComment) {
					if(err) {
						console.log(err);
						res.json({error: Errors.unknown});
					} else {
						res.json(savedComment);
					}
				});
			}
		});

	});
});

router.all('*', function(req, res, next) {
	if(!req.session.loggedIn) {
		res.json({error: Errors.notAuthorised})
	} else {
		next();
	}
});

router.put('/moderate/:id', function(req, res) {
	var id = req.params.id;
	var status = req.body.status;

	if(!mongoose.Types.ObjectId.isValid(id) || ['approved', 'removed'].indexOf(status) === -1) {
		res.json({error: Errors.invalidParams});
	} else {
		Comment.findOneAndUpdate({_id: mongoose.Types.ObjectId(id)}, {$set: {status: status} }, {new: true}, function(err, updatedComment) {
			if(err) {
				console.log(err);
				res.json({error: Errors.unknown});
			} else {
				res.json(updatedComment);
			}
		})
	}
});

router.delete('/moderate/:id', function(req, res) {
	var id = req.params.id;

	if(!mongoose.Types.ObjectId.isValid(id)) {
		res.json({error: Errors.invalidParams});
	} else {
		Comment.findOneAndRemove({_id: id}, function(err) {
			if(err) {
				console.log(err);
				res.json({error: Errors.unknown});
			} else {
				res.json({success: true});
			}
		});
	}

});

module.exports = router;