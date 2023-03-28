const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// console.log("** PATH ** --> ", path.resolve(__dirname, "dist"));
// console.log("** PATH ** --> ", path.join(__dirname, "dist"));
module.exports = {
  //   mode: "production",
  //   mode: "development",
  mode: process.env.NODE_ENV,
  entry: "./src/client/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },

      {
        test: /\.s?css$/,
        exclude: /node_modules/,
        use: ["style-loader", "css-loader", "sass-loader"], // ORDER MATTERS HERE, RUNS RIGHT to LEFT
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Benford Main",
      template: "./src/client/index.html",
    }),
  ],
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, "dist"),
    },
    compress: true,
    port: 8080, // DEFAULT PORT is 8080
    hot: true,
    proxy: {
      "/api": "http://localhost:3000",
      secure: false,
    },
  },
};
