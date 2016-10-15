var express = require('express');
var path = require('path');
var multer = require('multer')({ dest: path.resolve(__dirname, '../../tmp/') });
var Errors = require('../../errors.js');
var fs = require('fs');
var router = express.Router();

router.all('*', function(req, res, next) {
	if(!req.session.loggedIn) {
		res.json({error: Errors.notAuthorised})
	} else {
		next();
	}
});

router.post('/', multer.single('image'), function(req, res) {
	console.log(req.file)

	if(req.file && req.file.mimetype.match(/image\/[a-z]+/)) {
		var newName = req.file.filename + '.' + req.file.mimetype.split('/')[1];
		var newPath = path.resolve(__dirname, '../../public/img/uploads/' + newName);

		fs.rename(req.file.path, newPath, function(err) {
			if(err) {
				console.log(err);
				res.json({error: Errors.unknown});
			} else {
				res.json({url: '/public/img/uploads/' + newName})
			}
		});
	}
});

module.exports = router;