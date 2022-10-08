const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
	mode: 'development',
	//  context: __dirname,
	entry: {
		bundle: './src/main.js',
		worker: './src/worker.js',
		// tests: './src/gs/tests.js',

		test: ['./test/util/Cryptor.test.js', './test/util/Deflater.test.js'], // './test/webrtc/YadorigiFileProsessor.test.js', './test/webrtc/YadorigiSignalingAdupter.test.js'],
	},
	// [
	//   './src/main.js','./src/worker.js', './index.css'
	// ],mymodernmet.com/studio-ghibli-virtual-backgrounds/
	output: {
		// 出力するファイル名
		// filename: '[name].js',
		filename: '[name].js',
		// 出力先のパス
		// path: __dirname + '/public',
		path: path.join(__dirname, 'public'),
		//publicPath: __dirname + "/dest/js",
		webassemblyModuleFilename: '[modulehash].wasm',
		publicPath: '/',
		globalObject: 'this',
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					{
						loader: 'style-loader!css-loader?importLoaders=1&camelCase',
					},
				],
			},
			{
				test: /\.js$/,
				exclude: [/node_modules/, '/src/gs/'],
			},
			{
				test: /\.wasm$/,
				type: 'webassembly/experimental',
			},
			{
				test: /test\.js$/,
				exclude: [/node_modules/, '/src/gs/'],
			},
		],
	},
	devServer: {
		port: 8085,
		hot: 'only',
		open: ['/index.html'],
		watchFiles: {
			paths: ['src/**/*.js', 'dist/**/*'],
			options: {
				usePolling: false,
			},
		},
		// contentBase: path.join(__dirname, 'dist'),
		// publicPath: '/',
		// static: {
		// 	directory: path.join(__dirname, 'dist'),
		// 	serveIndex: true,
		// 	watch: false,
		// },
		client: {
			logging: 'info',
			// Can be used only for `errors`/`warnings`
			//
			// overlay: {
			//   errors: true,
			//   warnings: true,
			// }
			overlay: true,
			progress: true,
		},
	},
	plugins: [
		new webpack.LoaderOptionsPlugin({
			// test: /\.xxx$/,  may apply this only for some modules
			options: {
				html: './index.html',
			},
		}),
		//new webpack.optimize.UglifyJsPlugin(),
		//new webpack.optimize.AggressiveMergingPlugin(),

		new HtmlWebpackPlugin({
			// http://localhost:8085/testmocha.html
			filename: 'testmocha.html',
			inject: 'body',
			chunks: ['test'],
		}),
	],
	devtool: 'source-map',
	resolve: {
		extensions: ['.js'],
	},
};
