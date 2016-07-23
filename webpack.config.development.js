const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TransferWebpackPlugin = require('transfer-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({ size: 5 });

const autoprefixer = require('autoprefixer');
const precss = require('precss');

const entryConfig = require('./config/entries.json');

// 定义常量
const defineVars = {
	__DEV__: true,
	__DEV_TOOLS__: true,
	'process.env.NODE_ENV': '"development"'
};

// 页面生成插件
const HtmlWebpackPluginOptions = {
    inject: true,
    hash: true, // 开启追加哈希的行为
    minify: {
        removeComments: false,
        collapseWhitespace: false
    }
};

const PATHS = {
	NODE_MODULES: path.join(__dirname, 'node_modules'),
	ROOT: path.join(__dirname, '.'),
	CONSTANTS: path.join(__dirname, 'constants'),
	STYLE: path.join(__dirname, 'client/styles'),
	MODULE: path.join(__dirname, 'client/modules'),
	TEMPLATE: path.join(__dirname, 'client/templates'),
	RESOURCE: path.join(__dirname, 'client/resources'),
	STATIC: path.join(__dirname, 'client/static'),
	ACTION: path.join(__dirname, 'client/redux/actions'),
	COMPONENT: path.join(__dirname, 'client/redux/components'),
	CONTAINER: path.join(__dirname, 'client/redux/containers'),
	MIDDLEWARE: path.join(__dirname, 'client/redux/middlewares'),
	REDUCER: path.join(__dirname, 'client/redux/reducers'),
	STORE: path.join(__dirname, 'client/redux/stores'),
	BUILD: path.join(__dirname, 'assets/dist/development'),
	UTILS: path.join(__dirname, 'client/utils'),
};

const WEBPACK_HOT_MIDDLE_WARE = 'webpack-hot-middleware/client';

const plugins = [
	// 清理陈旧代码
	new CleanWebpackPlugin([PATHS.BUILD]),
	// 分离代码
	// extract inline css into separate 'style.css'
	new ExtractTextPlugin('[name].style.css', {
		disable: false,
		allChunks: true
	}),
    /*
	new HappyPack({
		id: 'jsx',
		threadPool: happyThreadPool,
		loaders: ['babel-loader?cacheDirectory']
	}),
    */
	// 共享代码
	new webpack.optimize.CommonsChunkPlugin( /* chunkName= */ 'vendor', /* filename= */ 'vendor.js'),
    new webpack.optimize.OccurenceOrderPlugin(),
    // webpack-dev-server 加了--hot 参数则不需要以下被注释的插件
	new webpack.HotModuleReplacementPlugin(),
	new webpack.NoErrorsPlugin(),
	new webpack.DefinePlugin(defineVars),
    /*
    new webpack.ProvidePlugin({
		'fetch': 'imports?this=>global!exports?global.fetch!isomorphic-fetch'
    }),
    */
	// 复制移动文件
	new TransferWebpackPlugin([{
		from: PATHS.STATIC
	}])
];

const entries = {};

entryConfig.forEach((item) => {
	item.entry.splice(0, 0, WEBPACK_HOT_MIDDLE_WARE)
	entries[item.name] = item.entry;

	// 根据模板插入css/js等生成最终HTML
	plugins.push(new HtmlWebpackPlugin(Object.assign({}, HtmlWebpackPluginOptions, {
		filename: `${item.name}.html`,
		template: path.join(PATHS.TEMPLATE, item.template),
        chunks: ['vendor', item.name],
	})))
});

entries['vendor'] = ['babel-polyfill'];

module.exports = {
	// configuration
	entry: entries,
	output: {
		path: PATHS.BUILD,
		filename: "[name].bundle.js",
		chunkFilename: "[id].bundle.js",
		publicPath: '/static/'
	},
	devtool: "cheap-module-source-map",
	// devtool: "source-map",
	externals: {
		// 使用CDN将react系套件全局化, 需要在html模板页加上script src引用
		//'react': 'React',
		//'react-dom': 'ReactDOM'
	},
	resolve: {
		extensions: ['', '.js'],
		alias: {
			node_modules: PATHS.NODE_MODULES,
			containers: PATHS.CONTAINER,
			components: PATHS.COMPONENT,
			styles: PATHS.STYLE,
			resources: PATHS.RESOURCE,
            actions: PATHS.ACTION,
            reducers: PATHS.REDUCER,
            constants: PATHS.CONSTANTS,
            stores: PATHS.STORE,
            utils: PATHS.UTILS,
		}
	},
	stats: {
		// Configure the console output
		colors: true,
		modules: true,
		reasons: true
	},
	module: {
		loaders: [{
				test: /\.js[x]?$/,
				include: __dirname,
				exclude: [
					path.resolve(__dirname, 'node_modules')
				],
                // loader: 'happypack/loader?id=jsx'
                loader: 'babel?cacheDirectory=./.happypack'
			},
			// Less/css代码
			{
				test: /\.less|\.css$/,
				exclude: [
					path.resolve(__dirname, 'node_modules')
				],
				// modules 模块化，可以在样式中composes: className. 然后less已经解决了这个问题
				// minimize 最小化
				// sourceMap 源文件隐射
				loader: ExtractTextPlugin.extract("style-loader", "css-loader?modules&sourceMap!postcss-loader!less-loader?sourceMap")
			}, {
				test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'url?limit=10000&minetype=application/font-woff'
			}, {
				test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'url?limit=10000&minetype=application/font-woff'
			}, {
				test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'url?limit=10000&minetype=application/octet-stream'
			}, {
				test: /\.ijmap(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'url?limit=10000&minetype=application/font-woff'
			}, {
				test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'file'
			}, {
				test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'url?limit=10000&minetype=image/svg+xml'
			}, {
				test: /\.(jpe?g|png|gif|svg)$/i,
				loaders: [
					'file?hash=sha512&digest=hex&name=[hash].[ext]',
					'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
				]
			}
		]
	},
	postcss: function() {
		return [autoprefixer, precss];
	},
	progress: true,
	keepalive: true,
	plugins: plugins,
	watchOptions: {
		aggregateTimeout: 500, // default 300ms
		poll: true
	},
    /*
	devServer: {
        historyApiFallback: true,
        hot: false,
        inline: true,
        progress: true,
        proxy: {
          '/v1_activity/*': {
            target: 'http://h5.test.knowbox.cn:8121',
            // target: 'http://betapi.knowbox.cn',
            secure: false,
            changeOrigin: true
          },
          '/v1_common/*': {
            target: 'http://h5.test.knowbox.cn:8121',
            // target: 'http://api.knowbox.cn',
            secure: false,
            changeOrigin: true
          }
        }
    }
    */
};
