var flexBoxGridCorrect = require('../flexBoxGridCorrect.js');
var pageViewsGraph = require('../components/pageViewsGraph.js');
var browserPieChart = require('../components/browserPieChart.js');
	
module.exports = function(Vue) {
	return Vue.extend({
		template: require('html!./dashboard.html'),
		ready: function() {
			flexBoxGridCorrect('#widgets-holder', 'widget');
			pageViewsGraph.make();
			browserPieChart.make();

			var ticking = false;
			window.addEventListener('resize', function() {
				if(ticking) return;
				setTimeout(function() {
					pageViewsGraph.update(pageViewsGraph.width());
					browserPieChart.update(browserPieChart.width());

					ticking = false;
				}, 50);
				ticking = true;
			});
		}
	});
};