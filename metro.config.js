const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const { withSentryConfig } = require('@sentry/react-native/metro');

const jsoMetroPlugin = require('obfuscator-io-metro-plugin')(
  // By default in the plugin github -- https://github.com/whoami-shubham/obfuscator-io-metro-plugin
  //High obfuscation, low performance -- The performance will be much slower than without obfuscation https://github.com/javascript-obfuscator/javascript-obfuscator
  {
    // for these option look javascript-obfuscator library options from  above url
    // compact: false,
    sourceMap: false, // source Map generated after obfuscation is not useful right now so use default value i.e. false
    compact: true, // compact the code
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 1,
    // debugProtection: true,
    // debugProtectionInterval: 4000,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 5,
    stringArray: true,
    stringArrayCallsTransform: true,
    // stringArrayEncoding: ['rc4'], FIXME:Cuidado con esta opción, puede romper el build release
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 5,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 5,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 1,
    transformObjectKeys: true,
    unicodeEscapeSequence: false,
  },
  {
    runInDev: false /* optional */,
    logObfuscatedFiles: true /* optional generated files will be located at ./.jso */,
  },
);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  ...jsoMetroPlugin,
};

module.exports = withSentryConfig(mergeConfig(getDefaultConfig(__dirname), config));
