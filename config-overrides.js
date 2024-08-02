const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const fs = require('fs');

const getFileManagerPlugin = () => {
  const isExtensionBuild = process.env.REACT_APP_BUILD_TARGET === "extension";
  const webAppBuildFiles = [
    "index.html",
    "favicon.ico",
    "logo192.png",
    "logo512.png",
    "robots.txt",
    "asset-manifest.json",
  ];
  const extensionBuildFiles = [
    "icon16.png", 
    "icon48.png", 
    "icon128.png",
    "options/*",
    "popup/*"
  ];

  const manifestFiles = {
    webApp: "build/web-app-manifest.json",
    extension: "build/extension-manifest.json",
  };

  return new FileManagerPlugin({
    events: {
      onEnd: {
        copy: [
          {
            source: isExtensionBuild
              ? manifestFiles.extension
              : manifestFiles.webApp,
            destination: "build/manifest.json",
          },
        ],
        delete: Object.values(manifestFiles).concat(
          (isExtensionBuild ? webAppBuildFiles : extensionBuildFiles).map(
            (filename) => `build/${filename}`
          )
        ),
      },
    },
  });
};

module.exports = {
  webpack: function (config) {
    const isExtensionBuild = process.env.REACT_APP_BUILD_TARGET === "extension";

    if (!isExtensionBuild) {
      config.plugins = config.plugins.concat(getFileManagerPlugin());
      return config;
    } else {
      config.optimization.splitChunks = {
        cacheGroups: {
          default: false,
        },
      };

      config.optimization.runtimeChunk = false;

      config.entry = {
        main: "./src/popup",
        background: "./src/serviceworker/background/index.ts",
        audioworker: "./src/serviceworker/audioworker/index.ts",
        content: './src/content/index.ts',
        options: './src/options',
        socket_sniffer: './src/lib/socket_sniffer/index.ts',
      };

      config.output = {
        ...config.output,
        //path: paths.appBuild,
        //pathinfo: true,
        filename: (pathData) => {
          const name = pathData.chunk.name;
          return `${name}/[name].js`;
        },
        //chunkFilename: 'js/[name]/[name].chunk.js',
      };

      config.plugins = config.plugins
        .filter((plugin) => !(plugin instanceof MiniCssExtractPlugin))
        .concat(
          new MiniCssExtractPlugin({
            filename: '[name]/[name].css',
            chunkFilename: '[name]/[name].chunk.css',
          }),
          // new HtmlWebpackPlugin({
          //   inject: true,
          //   chunks: ["popup"],
          //   //template: path.appHtml,
          //   filename: 'popup/index.html',
          // }),
          // new HtmlWebpackPlugin({
          //   inject: true,
          //   chunks: ["options"],
          //   //template: path.appHtml,
          //   filename: 'options/index.html',
          // }),
          getFileManagerPlugin()
        );

      return config;
    }
  },
};
