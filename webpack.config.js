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
        use: ["style-loader", "css-loader"], // , REMOVED "sass-loader" bc NOT USING.  ORDER MATTERS HERE, RUNS RIGHT to LEFT
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i, // ADDED THESE 3 LINES TO INCORPORATE .png IMAGE ON LANDING PAGE; CONFLICTED w/ react-hot-loader v. 4.13 & 4.6, so uninstalled latter.  Once stable, try "React Fast Refresh" as replacement for react-hot-loader --> https://github.com/pmmmwh/react-refresh-webpack-plugin/
        exclude: /node_modules/,
        use: ["file-loader"],
      },
      {
        test: /\.txt$/i, // ADDED THESE 2 LINES TO INCORPORATE .txt FILE CONTENTS ON LANDING PAGE
        use: "raw-loader",
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
  devtool: "eval-source-map", // ADDED TO AVOID FOLLOWING ERROR (appearing 3x in Chrome dev console:  "DevTools failed to load source map: Could not load content for webpack://benfordapp/node_modules/@remix-run/router/dist/router.js.map: Fetch through target failed: Unsupported URL scheme; Fallback: HTTP error: status code 404, net::ERR_UNKNOWN_URL_SCHEME".  NOTE:  Addition slows down page render time
};
