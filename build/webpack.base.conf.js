var path = require("path");
var fs = require("fs");
var utils = require("./utils");
var config = require("../config");
var vueLoaderConfig = require("./vue-loader.conf");
var MpvuePlugin = require("webpack-mpvue-asset-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var glob = require("glob");

function resolve(dir) {
  return path.join(__dirname, "..", dir);
}

function getEntry(rootSrc, pattern) {
  var files = glob.sync(path.resolve(rootSrc, pattern));
  return files.reduce((res, file) => {
    var info = path.parse(file);
    var key = info.dir.slice(rootSrc.length + 1) + "/" + info.name;
    res[key] = path.resolve(file);
    return res;
  }, {});
}

const appEntry = { app: resolve("./src/main.ts") };
const pagesEntry = getEntry(resolve("./src"), "pages/**/main.ts");
const entry = Object.assign({}, appEntry, pagesEntry);

module.exports = {
  // 如果要自定义生成的 dist 目录里面的文件路径，
  // 可以将 entry 写成 {'toPath': 'fromPath'} 的形式，
  // toPath 为相对于 dist 的路径, 例：index/demo，则生成的文件地址为 dist/index/demo.js
  entry,
  target: require("mpvue-webpack-target"),
  output: {
    path: config.build.assetsRoot,
    filename: "[name].js",
    publicPath:
      process.env.NODE_ENV === "production"
        ? config.build.assetsPublicPath
        : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: [".js", ".vue", ".json", ".ts"],
    alias: {
      vue: "mpvue",
      "@": resolve("src"),
      debug: resolve("src/utils/debug")
    },
    symlinks: false
  },
  resolveLoader: {
    modules: ["node_modules", path.resolve(__dirname, "loaders")]
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: "eslint-loader",
        enforce: "pre",
        include: [resolve("src"), resolve("test")],
        options: {
          formatter: require("eslint-friendly-formatter")
        }
      },
      {
        test: /\.vue$/,
        loader: "mpvue-loader",
        options: vueLoaderConfig
      },
      {
        test: /\.tsx?$/,
        // include: [resolve('src'), resolve('test')],
        exclude: /node_modules/,
        use: [
          "babel-loader",
          {
            loader: "mpvue-loader",
            options: {
              checkMPEntry: true
            }
          },
          {
            // loader: 'ts-loader',
            loader: "awesome-typescript-loader",
            options: {
              // errorsAsWarnings: true,
              useCache: true
            }
          }
        ]
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
                url: false
              }
            },
            "less-loader"
          ]
        })
      },
      {
        test: /\.js$/,
        include: [resolve("src"), resolve("test")],
        use: [
          "babel-loader",
          {
            loader: "mpvue-loader",
            options: {
              checkMPEntry: true
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: utils.assetsPath("images/[name].[ext]")
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: utils.assetsPath("media/[name]].[ext]")
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: utils.assetsPath("fonts/[name].[ext]")
        }
      }
      // {  // mpvue 通过 consolidate 来加载模板，所以这里用不到
      //   test: /\.(jinja2|njk|nunjucks)$/,
      //   exclude: /node_modules/,
      //   loader: "nunjucks-plain-loader"
      // }
    ]
  },
  plugins: [new MpvuePlugin()]
};
