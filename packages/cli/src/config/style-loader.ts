import MiniCssExtractPlugin from "mini-css-extract-plugin";

export function getStyleLoader(dev = true) {
  return [
    dev ? "style-loader" : MiniCssExtractPlugin.loader,
    "css-loader",
    "sass-loader",
  ];
}
