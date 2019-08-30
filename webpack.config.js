//↓↓↓↓追加
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
	//  context: __dirname,
	entry: {
		bundle: './src/main.js',
		worker: './src/worker.js',
		tests: './src/gs/tests.js',

		test: ['./test/util/Cryptor.test.js', './test/util/Deflater.test.js']
	},
	// [
	//   './src/main.js','./src/worker.js', './index.css'
	// ],
	output: {
		// 出力するファイル名
		filename: '[name].js',
		// 出力先のパス
		path: __dirname + '/dist',
		//publicPath: __dirname + "/dest/js",
		webassemblyModuleFilename: '[modulehash].wasm',
		publicPath: './',
		globalObject: 'this'
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader?importLoaders=1&camelCase'
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				enforce: 'pre',
				use: [
					{
						loader: 'eslint-loader'
					}
				]
			},
			{
				test: /\.wasm$/,
				type: 'webassembly/experimental'
			},
			{
				test: /test\.js$/,
				use: {
					loader: 'mocha-loader',
					options: {
						// mocha.setup(option)に渡すオプションが書ける
						// https://mochajs.org/#running-mocha-in-the-browser
					}
				},
				exclude: /node_modules/
			}
		]
	},
	devServer: {
		publicPath: '/',
		contentBase: __dirname + '/',
		watchContentBase: true,
		port: 8085
	},
	plugins: [
		new webpack.LoaderOptionsPlugin({
			// test: /\.xxx$/,  may apply this only for some modules
			options: {
				html: './index.html'
			}
		}),
		new CopyWebpackPlugin(
			[
				{
					from: './wasm/*.wasm',
					to: './'
				}
			],
			{ debug: 'debug' }
		),
		//new webpack.optimize.UglifyJsPlugin(),
		//new webpack.optimize.AggressiveMergingPlugin(),

		new HtmlWebpackPlugin({
			// http://localhost:8085/testmocha.html
			filename: 'testmocha.html',
			inject: 'body',
			chunks: ['test']
		})
	],
	devtool: 'source-map',
	resolve: {
		extensions: ['.js']
	}
};
