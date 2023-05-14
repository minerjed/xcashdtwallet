const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	/**
	 * This is the main entry point for your application, it's the first file
	 * that runs in the main process.
	 */
	entry: './workspaces/electron-xcash-app/main/index.ts',
	// Put your normal webpack config below here
	module: {
		rules: require('./webpack.rules'),
	},
	resolve: {
		extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
		modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'workspaces/electron-xcash-app/main/assets' },
				{
					from: 'workspaces/angular-xcash-app/.dist/angular-xcash-app',
					to: '../renderer/angular_window',
					noErrorOnMissing: true,
				},
			],
		}),
	],
};
