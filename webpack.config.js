var path = require('path');

module.exports = {
	context: path.join(__dirname, 'public', 'js', 'src'),
	entry: {app: './app.js', blog: './comments.js'},
	output: {
		path: path.join(__dirname, 'public', 'js'),
		filename: '[name].bundle.js'
	}
};