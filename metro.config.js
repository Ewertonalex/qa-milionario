const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurar entry point para web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config; 