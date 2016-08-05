var express = require('express');
var router = express.Router();

var Post = require('./models/post.js');
var settings = require('./models/settings.js');

router.get('/', function(req, res) {
	settings.get(req.app.locals.db, function(err, settingsDoc) {
			Post.find({published: true}, null, {sort: '-date'}, function(err, posts) {
			if(!err) {
				var JSONPosts = [];

				if(posts) {
					JSONPosts = posts.map(function(post) {
						return post.toJSON({virtuals: true});
					});
				}
				res.render('index.html', {posts: JSONPosts, settings: settingsDoc});
			}
		});
	});
});

router.get('/post/:slug', function(req, res) {
	settings.get(req.app.locals.db, function(err, settingsDoc) {
		Post.findOne({published: true, slug: req.params.slug}, function(err, foundPost) {
			if(!err) {
				if(foundPost) {
					res.render('post.html', {post: foundPost.toJSON({virtuals: true}), settings: settingsDoc});
				} else {
					res.render('post.html');
				}
				
			}
		});
	});
});

router.get('/tags/:tags', function(req, res) {
	var tags = req.params.tags.split('+');

	settings.get(req.app.locals.db, function(err, settingsDoc) {
		Post.find({published: true, tags: {$in: tags}}, null, {sort: '-date'}, function(err, posts) {
			if(!err) {
				var JSONPosts = [];

				if(posts) {
					JSONPosts = posts.map(function(post) {
						return post.toJSON({virtuals: true});
					});
				}
				
				res.render('index.html', {posts: JSONPosts, tags: tags.join(', '), settings: settingsDoc});
			}
		});
	});
});

module.exports = router;