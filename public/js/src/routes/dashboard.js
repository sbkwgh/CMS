var modals = require('../modals.js');
var Errors = require('../../../../errors.js');

var flexBoxGridCorrect = require('../flexBoxGridCorrect.js');
var pageViewsGraph = require('../components/pageViewsGraph.js');
var browserPieChart = require('../components/browserPieChart.js');
	
module.exports = function(Vue) {
	return Vue.extend({
		template: require('html!./dashboard.html'),
		data: function() {
			return {
				ui: {
					date: new Date(),
					time: (new Date()).toTimeString().slice(0,5)
				},
				cookies: (function() {
					var cookies = {};
					decodeURIComponent(document.cookie)
						.split(';')
						.forEach(c => {
							var temp = c.split('=');
							cookies[temp[0].trim()] = temp[1];
						});
					return cookies;
				})(),
				posts: {
					all: [],
					drafts: 0,
					published: 0,
					views: []
				},
				latestPost: {
					comments: 0,
					views: 0
				},
				analytics: {
					pageViews: null
				}
			}
		},
		methods: {
			sortPosts: function(posts) {
				posts.forEach(function(post) {
					if(post.published) {
						this.posts.published++;
					} else {
						this.posts.drafts++;
					}
				}.bind(this));
			},
			getLatestPostStats: function(posts) {
				var postId, postSlug, latestPostViews = 0, allPostViews = {}, allPostViewsArr = [];

				for(var i = 0; i < posts.length; i++) {
					if(posts[i].published) {
						postId = posts[i]._id;
						postSlug = posts[i].slug;

						break;
					}
				}

				this.$http
					.get('/api/comments/' + postId)
					.then(function(res) {
						if(res.data.error && res.data.error.name !== 'commentsDisabled') {
							modals.alert(res.data.error.message);
						} else {
							this.latestPost.comments = res.data.length || 0;
						}
					}, function(err) {
						console.log(err);
						modals.alert(Errors.unknown.message);
					});

				this.analytics.all.forEach(function(session) {
					session.paths.forEach(function(path) {
						var post = path.path.split('/blog/post/')[1];

						if(path.path === '/blog/post/' + postSlug) {
							latestPostViews++;
						}
						if(post) {
							if(!allPostViews[post]) allPostViews[post] = 0;

							allPostViews[post]++; 
						}
					});
				});

				this.posts.all.forEach(function(post) {
					if(allPostViews[post.slug] && post.published) {
						allPostViewsArr.push({
							slug: post.slug,
							title: post.title,
							views: allPostViews[post.slug]
						});
					}
				});

				this.latestPost.views = latestPostViews;
				this.posts.views = allPostViewsArr.sort(function(a, b) {
					return b.views - a.views
				}).slice(0, 3);
			},
			getPageViewsPerDay: function(data) {
				this.$http
					.get('/api/analytics?ordered=date')
					.then(function(res) {
						if(res.data.error) {
							modals.alert(res.data.error.message);
						} else {
							var pageViews = [];
							var pageViewsAddedDays = [];
				
							res.data.forEach(function(day) {
								var temp = 0;
								day.sessions.forEach(function(session) {
									temp+= session.paths.length;
								});

								pageViews.push({date: new Date(day.date), hits: temp});
							});
							pageViews = pageViews.reverse();
						
							pageViews.forEach(function(day, i, arr) {
								pageViewsAddedDays.push(day);

								if(!arr[i+1]) return;

								var oneDay = 24*60*60*1000;

								var currentDate = day.date.getTime();
								var nextDate = arr[i+1].date.getTime();

								var daysInBetween = (nextDate - currentDate) / (oneDay) - 1;

								for(var j = 1; j < daysInBetween+1; j++) {
									pageViewsAddedDays.push({
										date: new Date(currentDate + oneDay*j),
										hits: 0
									});
								}
							});

							pageViewsAddedDays = pageViewsAddedDays.slice(-10);



							if(pageViewsAddedDays.length < 10) {
								for(var i = 0, len = 10-pageViewsAddedDays.length; i < len; i++) {
									pageViewsAddedDays.unshift({
										date: new Date(pageViewsAddedDays[0].date.getTime() - 24*60*60*1000),
										hits: 0
									})
								}
							}
							pageViewsGraph.make(pageViewsAddedDays);
						}
					}, function(err) {
						console.log(err);
						modals.alert(Errors.unknown.message);
					});
			},
			getBrowserPageViews: function(postsData) {
				this.$http
					.get('/api/analytics')
					.then(function(res) {
						if(res.data.error) {
							modals.alert(res.data.error.message);
						} else {
							this.analytics.all = res.data;
							this.getLatestPostStats(postsData);

							var browserPageViews = {};
							res.data.forEach(function(user) {
								var browser = user.useragent.browser;
								if(!browserPageViews[browser]) {
									browserPageViews[browser] = 0;
								}

								browserPageViews[browser]++;
							});

							var browserPageViewsArr = [];
							Object
								.keys(browserPageViews)
								.forEach(function(browser) {
									browserPageViewsArr.push({
										name: browser,
										hits: browserPageViews[browser]
									});
								});

							browserPieChart.make(browserPageViewsArr);
						}
					}, function(err) {
						console.log(err);
						modals.alert(Errors.unknown.message);
					});
			},
			openPost: function(slug) {
				window.open('/blog/post/' + slug);
			}
		},
		ready: function() {
			flexBoxGridCorrect('#widgets-holder', 'widget');

			setInterval(function() {
				this.ui.time = (new Date()).toTimeString().slice(0,5);
			}.bind(this), 10000)

			var ticking = false;
			window.addEventListener('resize', function() {
				if(ticking || this.$route.path !== '/dashboard') return;
				setTimeout(function() {
					pageViewsGraph.update(pageViewsGraph.width());
					browserPieChart.update(browserPieChart.width());

					ticking = false;
				}, 50);
				ticking = true;
			}.bind(this));
		},
		route: {
			data: function(transition) {
				transition.next();

				this.$http
					.get('/api/posts')
					.then(function(res) {
						this.getPageViewsPerDay();

						if(res.data.error) {
							modals.alert(res.data.error.message);
						} else {
							this.posts.all = res.data;
							this.sortPosts(res.data);
							this.getBrowserPageViews(res.data);
						}
					}, function(err) {
						console.log(err);
						modals.alert(Errors.unknown.message);
					});
			}
		}
	});
};