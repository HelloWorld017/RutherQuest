const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: {
		ruther: path.resolve(__dirname, 'src', 'index.js')
	},

	output: {
	  	path: path.resolve(__dirname, 'dist'),
		filename: '[name].bundle.js',
		publicPath: '/dist/'
	},

	module: {
		rules: [{
			test: /\.js$/,
			loader: 'babel-loader',
			exclude: /node_modules/
		}]
	},

	devtool: '#eval-source-map'
};
