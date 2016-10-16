var express = require('express');

var argv = require('yargs').argv;

var compress = require('compression');
var session = require('express-session');
var useragent = require('express-useragent');
var bodyParser = require('body-parser');

var path = require('path');
var url = require('url');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;

var analytics = require('./models/analytics.js');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL || argv.mongo_url || 'mongodb://localhost/cms');
var db = mongoose.connection;

var app = express();

app.use(compress());
app.use(session({
	secret: argv.session_secret || process.env.SESSION_SECRET || 'secret',
	resave: false,
	saveUninitialized: true
}));
app.use(useragent.express());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static('public'));

app.engine('html', require('swig').renderFile);
app.set('view engine', 'html');
app.set('views', './templates');

if(!process.env.PRODUCTION) app.use(require('morgan')('dev'));

app.get('/login', function(req, res) {
	var sess = req.session;

	if(sess.loggedIn) {
		res.redirect('/cms/dashboard');
	} else {
		res.sendFile(path.join(__dirname, './public', 'login.html'));
	}
});

app.get('/logout', function(req, res) {
	res.clearCookie('author');
	req.session.regenerate(function(err) {
		if(!err) {
			res.redirect('/login');
		}
	});
});

app.use('/api/account', require('./routes/api/account.js'));
app.use('/api/posts', require('./routes/api/post.js'));
app.use('/api/comments', require('./routes/api/comment.js'));
app.use('/api/settings', require('./routes/api/settings.js'));
app.use('/api/analytics', require('./routes/api/analytics.js'));
app.use('/api/images', require('./routes/api/images.js'));

app.get('/cms', function(req, res) {
	res.redirect('/cms/dashboard');
});
app.get('/cms/*', function(req, res) {
	if(req.session.loggedIn) {
		res.sendFile(path.join(__dirname, './public', 'index.html'));
	} else {
		res.redirect('/login');
	}
});

app.use(function(req, res, next) {
	if(req.session.loggedIn || url.parse(req.originalUrl).pathname.split('/')[1] !== 'blog') {
		next();
	} else {
		analytics.add(req.app.locals.db, {
			ip: req.ip,
			path: decodeURIComponent(req.url),
			useragent: req.useragent,
			id: req.session.id
		}, function(err) {
			if(err) {
				console.log(err);
			}
			next();
		});
	}
});

app.get('/', function(req, res) {
	res.redirect('/blog');
});
app.use('/blog', require('./routes/blog.js'));


db.on('err', function() {
	console.log('Error in connecting to mongodb');
})
db.once('open', function() {
	MongoClient.connect(process.env.MONGO_URL || argv.mongo_url || 'mongodb://localhost/cms', function(err, db) {
		if(err) {
			console.log('Error in connecting to mongodb');
			return;
		}
		console.log(`Connected to mongodb (${process.env.MONGO_URL || argv.mongo_url || 'mongodb://localhost/cms'})`);

		app.locals.db = db;
		require('./models/settings.js').init(db);

		app.listen(process.env.PORT || argv.port || 3000, function() {
			console.log('Listening on port ' + (process.env.PORT || argv.port || 3000));
		});
	});
})
	