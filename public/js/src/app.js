var Vue = require('vue');
var VueRouter = require('vue-router');

window.titleTooltip = require('./titleTooltip.js');
window.Tooltip = require('./tooltip.js');

Vue.use(VueRouter);
Vue.use(require('vue-resource'));

Vue.filter('pluralize', function(word, number) {
	if(number === 1) {
		return word;
	} else {
		return word + 's';
	}
});

Vue.filter('prettyDate', function(d, showTime) {
	var months = 
		['January', 'February', 'March', 'April',
		 'May', 'June', 'July', 'August', 'September',
		 'October', 'November', 'December'],
	    date = d,
	    formattedString;

	if(typeof date === 'string') date = new Date(d);
	formattedString = date.getDate() + ' ' + months[date.getMonth()];
	if(showTime) formattedString += ', ' + date.toTimeString().slice(0,5);

	return formattedString;
});

var router = new VueRouter({mode: 'history', base: '/cms'});
var router = new VueRouter({
	routes: [
		{ path: '/posts', component: require('./routes/posts.js')(Vue) },
		{ path: '/posts/post/:id', component: require('./routes/postsNew.js')(Vue) },
		{ path: '/posts/new', component: require('./routes/postsNew.js')(Vue) },
		{ path: '/comments', component: require('./routes/comments.js')(Vue) },
		{ path: '/settings', component: require('./routes/settings.js')(Vue) },
		{ path: '/', redirect: '/dashboard', component: require('./routes/dashboard.js')(Vue) },
		{ path: '/design', component: require('./routes/design.js')(Vue) }
	]
})


var App = new Vue({
	router: router,
	components: {
		'navigation-menu': require('./components/navigationMenu.js')(Vue, router)
	}
}).$mount('#app');