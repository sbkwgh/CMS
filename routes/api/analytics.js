var express = require('express');
var Errors = require('../../errors.js');
var analytics = require('../../models/analytics.js');
var router = express.Router();

router.get('/', function(req, res) {
	if(!req.session.loggedIn) {
		res.json({error: Errors.notAuthorised});
	} else {
		analytics.get(req.app.locals.db, function(err, logs) {
			if(err) {
				console.log(err);
				res.json({error: Errors.unknown});
			} else if(req.query.ordered === 'date') {
				var sorted = {}, sortedArr = [];

				logs.forEach(function(user) {
					var temp = {};
					user.paths.forEach(function(pathObj) {
						var path = pathObj.path;
						var date = new Date(pathObj.time);
						var day = new Date(0)
							day.setDate(date.getDate());
							day.setMonth(date.getMonth());
							day.setFullYear(date.getFullYear());
						
						if(temp[day] === undefined) {
							temp[day] = {
								session: user.session,
								ip: user.ip,
								useragent: user.useragent,
								paths: [path]
							}
						} else {
							temp[day].paths.push(path)
						}
					});
					for(var key in temp) {
						if(sorted[key] === undefined) sorted[key] = [];

						sorted[key].push(temp[key]);
					}
				});

				Object
					.keys(sorted)
					.sort(function(a, b) {
						return new Date(b) - new Date(a);
					})
					.forEach(function(date) {
						sortedArr.push({
							date: date,
							sessions: sorted[date]
						});
					});

				res.json(sortedArr)
			} else {
				res.json(logs);
			}
		});
	}
});

module.exports = router;