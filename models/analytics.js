module.exports = {
	get: function(db, cb) {
		db.collection('analytics').find({}).toArray(cb);
	},
	add: function(db, obj, cb) {
		db.collection('analytics').update({session: obj.id}, {
			$set: {
				useragent: {
					browser: obj.useragent.browser,
					isDesktop: obj.useragent.isDesktop,
					os: obj.useragent.os,
					platform: obj.useragent.platform,
					browserVersion: obj.useragent.version,
					string: obj.useragent.source
				},
				ip: obj.ip
			},
			$push: {
				'paths': {
					path: obj.path,
					time: new Date()
				}
			}
		}, {upsert: true}, cb);
	}
};