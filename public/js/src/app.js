var Vue = require('vue/dist/vue.js');
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

var router = new VueRouter({
	mode: 'history',
	base: '/cms',
	routes: [
		{ path: '/posts', component: require('./routes/posts.js') },
		{ path: '/posts/post/:id', component: require('./routes/postsNew.js') },
		{ path: '/posts/new', component: require('./routes/postsNew.js') },
		{ path: '/comments', component: require('./routes/comments.js') },
		{ path: '/settings', component: require('./routes/settings.js') },
		{ path: '/dashboard', component: require('./routes/dashboard.js') },
		{ path: '/design', component: require('./routes/design.js') }
	]
})


var App = new Vue({
	router: router,
	components: {
		'navigation-menu': require('./components/navigationMenu.js')
	}
}).$mount('#app');