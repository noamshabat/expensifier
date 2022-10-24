const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv')
const webpack = require('webpack')
const out = dotenv.config();

const env = Object.entries(out.parsed).reduce((tenv, [key, val]) => { tenv[`process.env.${key}`] = JSON.stringify(val); return tenv }, {})
env['process.env.NODE_ENV'] = JSON.stringify('development')

module.exports = {
    mode: 'development',
    entry: {
        app: path.join(__dirname, 'src', 'index.tsx')
    },
    devtool: "source-map",
    target: 'web',
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: '/node_modules/'
            }
        ],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build')
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public' }
            ]
        }),
        new webpack.DefinePlugin(env)
    ]
}