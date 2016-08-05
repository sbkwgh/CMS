var Vue = require('./vue.js');
var VueRouter = require('./vue-router.js');

window.titleTooltip = require('./titleTooltip.js');


var Tooltip = require('./tooltip.js');
window.Tooltip = Tooltip;

Vue.use(VueRouter);
Vue.use(require('vue-resource'));

var router = new VueRouter({history: true, root: '/cms'});


var App = Vue.extend({
	components: {
		'navigation-menu': require('./components/navigationMenu.js')(Vue, router)
	}
});

router.map({
	'/posts': {
		component: require('./routes/posts.js')(Vue)
	},
	'/posts/post/:id': {
		component: require('./routes/postsNew.js')(Vue)
	},
	'/posts/new': {
		component: require('./routes/postsNew.js')(Vue)
	},
	'/comments': {
		component: require('./routes/comments.js')(Vue)
	},
	'/settings': {
		component: require('./routes/settings.js')(Vue)
	}
});

router.redirect({
	'/': '/dashboard'
});

router.start(App, '#app');