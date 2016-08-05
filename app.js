var express = require('express');
var compress = require('compression');
var session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/cms');
var db = mongoose.connection;

var app = express();

app.use(compress());
app.use(session({
	secret: 'session secret' || process.ENV.SECRET,
	resave: false,
	saveUninitialized: true
}));
app.use(bodyParser.json());
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
	req.session.regenerate(function(err) {
		if(!err) {
			res.redirect('/login');
		}
	});
});

app.use('/api/account', require('./api/account.js'));
app.use('/api/posts', require('./api/post.js'));
app.use('/api/comments', require('./api/comment.js'));
app.use('/api/settings', require('./api/settings.js'));

app.get('/', function(req, res) {
	res.redirect('/blog');
});
app.use('/blog', require('./blog.js'));


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


db.on('err', function() {
	console.log('Error in connecting to mongodb');
})
db.once('open', function() {
	MongoClient.connect(process.env.MONGO_URL || 'mongodb://localhost/cms', function(err, db) {
		if(err) {
			console.log('Error in connecting to mongodb');
			return;
		}
		console.log('Connected to mongodb');

		app.locals.db = db;
		require('./models/settings.js').init(db);

		app.listen(process.env.PORT || 3000, function() {
			console.log('Listening on port ' + (process.env.PORT || 3000));
		});
	});
})
	