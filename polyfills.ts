import 'react-native-url-polyfill/auto';
if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer/').Buffer;
}
if (typeof global.process === 'undefined') {
  global.process = require('process');
}