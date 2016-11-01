var Vue = require('vue/dist/vue.js');
var modals = require('../modals.js');
var Errors = require('../../../../errors.js');

var Settings = Vue.extend({
	template: require('html!./settings.html'),
	data: function() {
		return {
			general: {
				blogTitle: '',
				blogDescription: '',
				blogSidebar: '',
				commentsModerated: false,
				commentsMessage: '',
				commentsAllowed: false,
				saving: {
					general: false,
					comments: false
				}
			},
			account: {
				author: '',
				biography: '',
				password: '',
				confirmPassword: '',
				saving: {
					settings: false,
					password: false
				}
			}
		}
	},
	methods: {
		saveAccountSettings: function() {
			this.account.saving.settings = true;

			this.$http
				.put('/api/account', {
					author: this.account.author.trim(),
					biography: this.account.biography.trim()
				})
				.then(function(res) {
					this.account.saving.settings = false;

					if(res.data.error) {
						titleTooltip(this.$refs.account, res.data.error.message, 5000);
					} else {
						titleTooltip(this.$refs.account, 'Settings saved', 5000);
					}
				}, function(err) {
					this.account.saving.settings = false;
					console.log(err);
					titleTooltip(this.$refs.account, Errors.unknown.message, 5000);
				});
		},
		saveGeneralSettings: function(button, e) {
			this.general.saving[button] = true;

			var params;

			if(button === 'general') {
				params = {
					blogTitle: this.general.blogTitle,
					blogDescription: this.general.blogDescription,
					blogSidebar: this.general.blogSidebar
				};
			} else {
				params = {
					commentsModerated: this.general.commentsModerated,
					commentsMessage: this.general.commentsMessage,
					commentsAllowed: this.general.commentsAllowed
				}
			}

			this.$http
				.put('/api/settings', params)
				.then(function(res) {
					this.general.saving[button] = false;

					if(res.data.error) {
						titleTooltip(e.target, res.data.error.message, 5000);
					} else {
						titleTooltip(e.target, 'Settings saved', 5000);
					}
				}, function(err) {
					this.general.saving[button] = false;
					console.log(err);
					titleTooltip(e.target, Errors.unknown.message, 5000);
				});
		},
		fetchData: function() {
			this.$http
				.get('/api/settings')
				.then(function(res) {
					if(res.data.error) {
						modals.alert(res.data.error.message);
					} else {
						this.general.blogDescription = res.data.blogDescription;
						this.general.blogSidebar = res.data.blogSidebar;
						this.general.blogTitle = res.data.blogTitle;
						this.general.commentsModerated = res.data.commentsModerated;
						this.general.commentsMessage = res.data.commentsMessage;
						this.general.commentsAllowed = res.data.commentsAllowed;
					}

				}, function(err) {
					console.log(err);
					modals.alert(Errors.unknown.message);
				});
			this.$http
				.get('/api/account')
				.then(function(res) {
					if(res.data.error) {
						modals.alert(res.data.error.message);
					} else {
						this.account.author = res.data.author;
						this.account.biography = res.data.biography || '';
					}
				}, function(err) {
					console.log(err);
					modals.alert(Errors.unknown.message);
				});
		}
	},
	created: function() {
		this.fetchData();
	},
	watch: {
		'$route': 'fetchData'
	}
});

module.exports = Settings;