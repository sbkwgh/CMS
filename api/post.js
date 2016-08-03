var express = require('express');
var Post = require('../models/post.js');
var ObjectId = require('mongoose').Schema.ObjectId;
//var Comment = require('../models/comment.js');
var Errors = require('../errors.js');

var router = express.Router();

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
	
	Post.findPostById(id, function(err, post) {
		if(err) {
			res.json({error: err});
		} else {
			res.redirect('/blog/post/' + post.slug);
		}
	});
});

router.post('/', function(req, res) {
	var postObject = {};
	postObject.title = req.body.title;
	postObject.markdown = req.body.markdown;
	postObject.tags = req.body.tags;
	if(req.body.published) {
		postObject.published = req.body.published;
	}
	
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
	var postObject = {};
	var id = req.params.id;

	postObject.title = req.body.title;
	postObject.markdown = req.body.markdown;
	postObject.tags = req.body.tags;

	if(typeof req.body.published !== 'undefined') {
		postObject.published = req.body.published;
	}

	if(!id.match(/^[0-9a-fA-F]{24}$/)) {
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
	
	Post.findPostById(id, function(err, post) {
		if(err) {
			res.json({error: err});
		} else {
			post.remove(function(err) {
				if(err) {
					console.log(err)
					res.json({error: Errors.unknown});
				} else {
					/*Comment.find({postId: ObjectId(req.params.id)}).remove(function(err, success) {
						if(err) {
							console.log(err)
							res.json({error: 'unknown error'})
						} else {*/
							res.json({success: true});
					/*	}
					})*/
				}
			});
		}
	
	});
});


module.exports = router;