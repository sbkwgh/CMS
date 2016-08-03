var express = require('express');
var router = express.Router();

var Post = require('./models/post.js');

router.get('/', function(req, res) {
	Post.find({published: true}, null, {sort: '-date'}, function(err, posts) {
		if(!err) {
			var JSONPosts = [];

			if(posts) {
				JSONPosts = posts.map(function(post) {
					return post.toJSON({virtuals: true});
				});
			}
			res.render('index.html', {posts: JSONPosts});
		}
	});
});

router.get('/post/:slug', function(req, res) {
	Post.findOne({published: true, slug: req.params.slug}, function(err, foundPost) {
		if(!err) {
			if(foundPost) {
				res.render('post.html', {post: foundPost.toJSON({virtuals: true})});
			} else {
				res.render('post.html');
			}
			
		}
	});
});

router.get('/tags/:tags', function(req, res) {
	var tags = req.params.tags.split('+');

	Post.find({published: true, tags: {$in: tags}}, null, {sort: '-date'}, function(err, posts) {
		if(!err) {
			var JSONPosts = [];

			if(posts) {
				JSONPosts = posts.map(function(post) {
					return post.toJSON({virtuals: true});
				});
			}
			
			res.render('index.html', {posts: JSONPosts, tags: tags.join(', ')});
		}
	});
});

module.exports = router;