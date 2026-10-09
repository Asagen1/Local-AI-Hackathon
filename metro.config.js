const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add .onnx extension to asset types for model bundling
config.resolver.assetExts.push('onnx');

module.exports = withNativeWind(config, { input: './global.css' });
