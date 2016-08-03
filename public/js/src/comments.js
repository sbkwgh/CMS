var Vue = require('./vue.js');
var VueResource = require('vue-resource');

window.titleTooltip = require('./titleTooltip.js');

Vue.use(VueResource);

Vue.filter('timeString',  function(value) {
	value = new Date(value);
	var month = value.getMonth();
	var day = value.getDay();

	if(month < 10) {
		month = '0' + month;
	}
	if(day < 10) {
		day = '0' + day;
	}
	
	return (
		value.getFullYear() + '/' + month + '/' + day +
		', ' +
		value.toLocaleTimeString().slice(0,-3)
	);
});

Vue.component('post-comments', require('./components/postComments.js')(Vue));

var App = new Vue({
	el: '#app'
});

