const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurar entry point para web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Definir entry point correto para web
config.resolver.sourceExts.push('web.js', 'web.ts', 'web.tsx');

module.exports = config; 