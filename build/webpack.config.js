const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = {
    entry: './src/app.js',
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, '../docs')
    },
    watch: true,
    module: {
        rules: [
            { test: /\.handlebars$/, loader: "handlebars-loader"},
            { test: /\.css$/, use: [
                MiniCssExtractPlugin.loader, {
                    loader: "css-loader", options: {}
                }
            ] },
            { test: /\.(jpe?g|png|gif)$/i, use: [
                {
                    loader: "file-loader",
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'assets/',
                        useRelativePath: true
                    }
                },
                {
                    loader: "image-webpack-loader",
                    options: {
                        mozjpeg: {
                            progressive: true,
                            quality: 75
                        },
                        optipng: {
                            enabled: true,
                        },
                        pngquant: {
                            quality: '65-90',
                            speed: 4
                        }
                    }
                }
            ]}
        ]
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                handlebarsLoader: {}
            }
        }),
        new MiniCssExtractPlugin({
           filename: "[name].styles.css",
           chunkFilename: "[id].css"
        }),
        new HtmlWebpackPlugin({
            title: 'TGeoSource_Lab',
            template: './src/index.handlebars',
            minify: {
                html5: true,
                collapseWhitespace: true,
                removeComments: true,
            }
        }),
        new CopyWebpackPlugin([{
            from: 'src/assets/', to: 'assets/'
        }]),
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 3002,
            server: { baseDir: ['docs'] }
        })
    ]
};