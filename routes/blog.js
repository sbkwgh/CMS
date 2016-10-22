var express = require('express');
var router = express.Router();

var Post = require('.././models/post.js');
var settings = require('.././models/settings.js');

var postsPerPage = 3;
function getPageNumbers(posts, currentPage) {
	var totalPages, nextPage, previousPage;

	var temp = posts.length/postsPerPage;
	if(Math.floor(temp) === temp) {
		totalPages = temp;
	} else {
		totalPages = Math.floor(temp)+1;
	}

	nextPage = currentPage+1;
	previousPage = currentPage-1;

	if(nextPage > totalPages) {
		nextPage = null;
	}
	if(previousPage < 0) {
		previousPage = null;
	}

	return {total: totalPages, next: nextPage, previous: previousPage};
}

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
				res.render('index.html', {
					posts: JSONPosts.slice(0, postsPerPage),
					pageNumbers: getPageNumbers(JSONPosts, 0),
					settings: settingsDoc
				});
			}
		});
	});
});

router.get('/page/0', function(req, res) {
	res.redirect('/');
});


router.get('/page/:page', function(req, res) {
	settings.get(req.app.locals.db, function(err, settingsDoc) {
			Post.find({published: true}, null, {sort: '-date'}, function(err, posts) {
			if(!err) {
				var JSONPosts = [];

				if(posts) {
					JSONPosts = posts.map(function(post) {
						return post.toJSON({virtuals: true});
					});
				}
				res.render('index.html', {
					posts: JSONPosts.splice(+req.params.page*postsPerPage, postsPerPage),
					pageNumbers: getPageNumbers(JSONPosts, +req.params.page),
					settings: settingsDoc
				});
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