var express = require('express');
var Post = require('../../models/post.js');
var Comment = require('../../models/comment.js');
var Errors = require('../../errors.js');
var paramsValidator = require('../../paramsValidator.js');
var router = express.Router();

var validObjectId = require('mongoose').Types.ObjectId.isValid;

var validator = paramsValidator({
	title: {type: 'string', required: true},
	markdown: {type: 'string', required: true},
	tags: 'array',
	commentsAllowed: {type: 'boolean', required: true}
});
var updateValidator = paramsValidator({
	title: 'string',
	markdown: 'string',
	tags: 'array',
	commentsAllowed: 'boolean'
});

router.get('/', function(req, res) {
	Post.find({}, null, {sort: '-date'}, function(err, posts) {
		if(err) {
			console.log(err);
			res.json({error: Errors.unknown});
			return;
		} else {
			res.json(posts.map(function(post) {
				return post.toJSON({virtuals: true})
			}));
		}
	});
});

router.all('*', function(req, res, next) {
	if(!req.session.loggedIn) {
		res.json({error: Errors.notAuthorised})
	} else {
		next();
	}
});

router.get('/:id', function(req, res) {
	var id = req.params.id;

	if(!validObjectId(id)) {
		res.json({error: Errors.invalidId});
		return;
	}
	
	Post.findPostById(id, function(err, post) {
		if(err) {
			res.json({error: err});
		} else {
			res.json(post.toJSON({virtuals: true}));
		}
	});
});

router.get('/:id/redirect', function(req, res) {
	var id = req.params.id;

	if(!validObjectId(id)) {
		res.json({error: Errors.invalidId});
		return;
	}
	
	Post.findPostById(id, function(err, post) {
		if(err) {
			res.json({error: err});
		} else {
			res.redirect('/blog/post/' + post.slug);
		}
	});
});

router.post('/', function(req, res) {
	var postObject = validator(req.body);
	if(postObject === null) {
		res.json({error: Errors.invalidParams});
		return;
	}
	if(req.body.published) postObject.published = req.body.published;
	
	var post = new Post(postObject);
	post.save(function(err, savedPost) {
		if(err) {
			console.log(err)
			res.json({error: Errors.unknown});
			return;
		} else {
			res.json(savedPost.toJSON({virtuals: true}));
		}
	});
});

router.put('/:id', function(req, res) {
	var postObject = updateValidator(req.body);
	var id = req.params.id;

	if(postObject === null) {
		res.json({error: Errors.invalidParams});
		return;
	}

	if(typeof req.body.published !== 'undefined') {
		postObject.published = req.body.published;
	}

	if(!validObjectId(id)) {
		res.json({error: Errors.invalidId});
		return;
	}

	Post.findOneAndUpdate({_id: id}, postObject, {}, function(err) {
		if(err) {
			console.log(err)
			res.json({error: Errors.unknown});
			return;
		}

		res.json(postObject);
	});
});

router.delete('/:id', function(req, res) {
	var id = req.params.id;

	if(!validObjectId(id)) {
		res.json({error: Errors.invalidId});
		return;
	}
	
	Post.findPostById(id, function(err, post) {
		if(err) {
			res.json({error: err});
		} else {
			post.remove(removePostComments);
		}
	});

	function removePostComments(err) {
		if(err) {
			console.log(err)
			res.json({error: Errors.unknown});
		} else {
			Comment.remove({postId: id}, function(err, success) {
				if(err) {
					console.log(err)
					res.json({error: 'unknown error'})
				} else {
					res.json({success: true});
				}
			})
		}
	}
});


module.exports = router;