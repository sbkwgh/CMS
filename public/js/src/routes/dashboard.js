var modals = require('../modals.js');
var Errors = require('../../../../errors.js');
var Vue = require('vue/dist/vue.js');

var flexBoxGridCorrect = require('../flexBoxGridCorrect.js');
var pageViewsGraph = require('../components/pageViewsGraph.js');
var browserPieChart = require('../components/browserPieChart.js');
	
var Dashboard = Vue.extend({
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
				pageViews: null,
				uniquePageViews: null,
				currentGraph: 'total',
				processed: {},
				all: [],
				loaded: false
			}
		}
	},
	methods: {
		getApiData: function(next) {
			var apis = [
				{url: '/api/posts', param: 'posts.all'},
				{url: '/api/analytics?ordered=date', param: 'analytics.dateOrdered'},
				{url: '/api/analytics', param: 'analytics.all'}
			];

			var self = this;

			var doneCount = 0;
			function done(param, data) {
				var params = param.split('.');
				if(params.length === 1) {
					self[param] = data;
				} else {
					self[params[0]][params[1]] = data;
				}

				if(param === 'posts.all') {
					getCommentsData(data);
				}

				doneCount++;
				//+1 because we send a further request, that depends
				//on getting the post id from /api/posts
				if(doneCount === apis.length+1) {
					next();
				}
			}

			function errorCb(err, param, showUnknownError) {
				if(showUnknownError) {
					console.log(err);
					modals.alert(Errors.unknown.message);
				} else {
					modals.alert(err.message);
				}

				done(param, null);
			}

			function getCommentsData(data) {
				var postId, postSlug;

				for(var i = 0; i < data.length; i++) {
					if(data[i].published) {
						postId = data[i]._id;
						postSlug = data[i].slug;

						break;
					}
				}

				if(!postId) {
					done('latestPost.comments', 0);
					return;
				}

				self.latestPost.slug = postSlug;

				self.$http.get('/api/comments/' + postId)
					.then(function(res) {
						if(res.data.error && res.data.error.name !== 'commentsDisabled') {
							errorCb(res.data.error, 'latestPost.comments');
						} else {
							done('latestPost.comments', res.data.length || 0);
						}
					}, function(err) {
						errorCb(err, 'latestPost.comments', true);
					});
			}

			apis.forEach(function(api, index) {

				self.$http.get(api.url)
					.then(function(res) {
						if(res.data.error) {
							errorCb(res.data.error, api.param);
						} else {
							done(api.param, res.data);
						}
					}, function(err) {
						errorCb(err, api.param, true);
					})
			});
		},
		sortPosts: function() {
			this.posts.all.forEach(function(post) {
				if(post.published) {
					this.posts.published++;
				} else {
					this.posts.drafts++;
				}
			}.bind(this));
		},
		getLatestPostStats: function(posts) {
			var latestPostViews = 0, allPostViews = {}, allPostViewsArr = [];

			var self = this;

			this.analytics.all.forEach(function(session) {
				session.paths.forEach(function(path) {
					var post = path.path.split('/blog/post/')[1];

					if(path.path === '/blog/post/' + self.latestPost.slug) {
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
		processData: function(data) {
			var dayMs = 24*60*60*1000;
			function getDaysInBetween(a, b) {
				var currentDate = a.getTime();
				var nextDate = b.getTime();

				return (nextDate - currentDate) / (dayMs) - 1;
			}

			var pageViews = data;
			var pageViewsAddedDays = [];

			//If there are no analytics data, give one piece of
			//dummy data to allow program to work
			if(!pageViews[0]) {
				return data;
			}

			//If the last page hit is not the current date, fill in the array
			//with items going up to the current date
			var daysBetweenLastViewAndCurrentDate = getDaysInBetween(pageViews[0].date, new Date());
			for(var i = 0; i < daysBetweenLastViewAndCurrentDate; i++) {
				pageViews.unshift({
					date: new Date(pageViews[0].date.getTime() + dayMs),
					hits: 0
				});
			}

			//If there are less than 10 items, fill the array up with
			//items going back in time
			if(pageViews.length < 10) {
				for(var i = 0, len = 10-pageViews.length; i < len; i++) {
					pageViews.push({
						date: new Date(pageViews.slice(-1)[0].date.getTime() - dayMs),
						hits: 0
					});
				}
			}

			//Now reverse so that it is date ascending
			pageViews = pageViews.reverse();
		
			//Fill in gaps between dates
			pageViews.forEach(function(day, i, arr) {
				pageViewsAddedDays.push(day);

				if(!arr[i+1]) return;


				var currentDate = day.date;
				var nextDate = arr[i+1].date;
				var daysInBetween = getDaysInBetween(currentDate, nextDate);

				for(var j = 1; j < daysInBetween+1; j++) {
					pageViewsAddedDays.push({
						date: new Date(currentDate.getTime() + dayMs*j),
						hits: 0
					});
				}
			});

			//Now take the last 10 dates
			pageViewsAddedDays = pageViewsAddedDays.slice(-10);

			return pageViewsAddedDays;
		},
		getPageViewsPerDay: function(update) {
			var totalPageViews = [];
		
			//Add up each of the page views on each of the sessions
			//for each day
			this.analytics.dateOrdered.forEach(function(day) {
				var temp = 0;
				day.sessions.forEach(function(session) {
					temp += session.paths.length;
				});

				totalPageViews.push({date: new Date(day.date), hits: temp});
			});

			var uniquePageViewsTemp = {}, uniquePageViews = [];
			this.analytics.all.forEach(function(session) {
				var date = new Date(session.paths[0].time)
				var dateSansTime = new Date(0);

				dateSansTime.setFullYear(date.getFullYear());
				dateSansTime.setMonth(date.getMonth());
				dateSansTime.setDate(date.getDate());

				if(!uniquePageViewsTemp[dateSansTime]) uniquePageViewsTemp[dateSansTime] = 0;

				uniquePageViewsTemp[dateSansTime]++;
			});
			Object.keys(uniquePageViewsTemp).forEach(function(date) {
				uniquePageViews.push({
					date: new Date(date),
					hits: uniquePageViewsTemp[date]
				});
			});
			uniquePageViews = uniquePageViews.sort(function(a, b) {
				return new Date(b.date) - new Date(a.date);
			});

			this.analytics.processed.unique = this.processData(uniquePageViews);
			this.analytics.processed.total = this.processData(totalPageViews);


		},
		changePageViewsGraph: function(type) {
			if(type === 'total') {
				this.analytics.currentGraph = 'total';
				pageViewsGraph.update(null, this.analytics.processed.total);
			} else {
				this.analytics.currentGraph = 'unique sessions';
				pageViewsGraph.update(null, this.analytics.processed.unique);
			}
		},
		getBrowserPageViews: function(postsData) {
			var browserPageViews = {};
			this.analytics.all.forEach(function(user) {
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
		},
		openPost: function(slug) {
			window.open('/blog/post/' + slug);
		},
		fetchData: function() {
			this.getApiData(function() {

				this.sortPosts();
				this.getLatestPostStats();
				this.getBrowserPageViews();

				this.getPageViewsPerDay();
				pageViewsGraph.make(this.analytics.processed.total);

				this.analytics.loaded = true;
			}.bind(this));
		}
	},
	mounted: function() {
		this.$nextTick(function() {
			flexBoxGridCorrect('#widgets-holder', 'widget');

			setInterval(function() {
				this.ui.time = (new Date()).toTimeString().slice(0,5);
			}.bind(this), 10000);

			Tooltip('#page-views-menu', {
				items: [
					{title: 'Total', click: () => this.changePageViewsGraph('total')},
					{title: 'Unique sessions', click: () => this.changePageViewsGraph('unique')}
				]
			})

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
		});
	},
	created: function() {
		this.fetchData();
	},
	watch: {
		'$route': 'fetchData'
	}
});

module.exports = Dashboard;