  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.readableString = exports.encryptString = exports.decryptString = exports.base64Encode = exports.base64Decode = exports.AESEncrypt = exports.AESDecrypt = undefined;
  var _slicedToArray2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var _reactNativeCryptoJs = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[2]));
  var _sha = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[3]));
  // Codifica una cadena en Base64
  var base64Encode = exports.base64Encode = function base64Encode(data) {
    var wordArray = _reactNativeCryptoJs.default.enc.Utf8.parse(data);
    return _reactNativeCryptoJs.default.enc.Base64.stringify(wordArray);
  };

  // Decodifica una cadena Base64
  var base64Decode = exports.base64Decode = function base64Decode(data) {
    var parsedWordArray = _reactNativeCryptoJs.default.enc.Base64.parse(data);
    return _reactNativeCryptoJs.default.enc.Utf8.stringify(parsedWordArray);
  };

  // Encripta una cadena de texto con clave y vector de inicialización
  var encryptString = exports.encryptString = function encryptString(plainText, key, iv) {
    var keyNumberArray = Array.from(key);
    var ivNumberArray = Array.from(iv);
    var keyWordArray = _reactNativeCryptoJs.default.lib.WordArray.create(keyNumberArray);
    var ivWordArray = _reactNativeCryptoJs.default.lib.WordArray.create(ivNumberArray);
    var encrypted = _reactNativeCryptoJs.default.AES.encrypt(plainText, keyWordArray, {
      iv: ivWordArray,
      mode: _reactNativeCryptoJs.default.mode.CBC,
      padding: _reactNativeCryptoJs.default.pad.Pkcs7
    });
    return encrypted.toString(); // Base64
  };

  // Desencripta una cadena de texto encriptada con AES
  var decryptString = exports.decryptString = function decryptString(cipherText, key, iv) {
    var keyNumberArray = Array.from(key);
    var ivNumberArray = Array.from(iv);
    var keyWordArray = _reactNativeCryptoJs.default.lib.WordArray.create(keyNumberArray);
    var ivWordArray = _reactNativeCryptoJs.default.lib.WordArray.create(ivNumberArray);
    var decrypted = _reactNativeCryptoJs.default.AES.decrypt(cipherText, keyWordArray, {
      iv: ivWordArray,
      mode: _reactNativeCryptoJs.default.mode.CBC,
      padding: _reactNativeCryptoJs.default.pad.Pkcs7
    });
    return decrypted.toString(_reactNativeCryptoJs.default.enc.Utf8);
  };

  // Convierte una cadena en Base64, separada por "@", a un JSON legible
  var readableString = exports.readableString = function readableString(completeChain) {
    var decodedChain = base64Decode(completeChain);
    var _decodedChain$split = decodedChain.split('@'),
      _decodedChain$split2 = (0, _slicedToArray2.default)(_decodedChain$split, 3),
      jsonString = _decodedChain$split2[0],
      ivString = _decodedChain$split2[1],
      keyString = _decodedChain$split2[2];
    var keyDecoded = base64Decode(keyString);
    var keyBytes = (0, _sha.default)(_reactNativeCryptoJs.default.enc.Utf8.parse(keyDecoded));
    var ivBytes = _reactNativeCryptoJs.default.enc.Base64.parse(ivString);
    var decrypted = _reactNativeCryptoJs.default.AES.decrypt(jsonString, keyBytes, {
      iv: ivBytes,
      mode: _reactNativeCryptoJs.default.mode.CBC,
      padding: _reactNativeCryptoJs.default.pad.Pkcs7
    });
    return decrypted.toString(_reactNativeCryptoJs.default.enc.Utf8);
  };
  var key = _reactNativeCryptoJs.default.enc.Utf8.parse("c879307e7ba9b450522cb58a1fe82a56"); // 32 bytes ASCII = AES-256
  var iv = _reactNativeCryptoJs.default.enc.Utf8.parse("5b03a3a9b940f661"); // 16 bytes ASCII

  var AESEncrypt = exports.AESEncrypt = function AESEncrypt(plainText) {
    var encrypted = _reactNativeCryptoJs.default.AES.encrypt(plainText, key, {
      iv: iv,
      mode: _reactNativeCryptoJs.default.mode.CBC,
      padding: _reactNativeCryptoJs.default.pad.Pkcs7
    });
    return encrypted.toString(); // Devuelve en base64
  };
  var AESDecrypt = exports.AESDecrypt = function AESDecrypt(cipherTextBase64) {
    var decrypted = _reactNativeCryptoJs.default.AES.decrypt(cipherTextBase64, key, {
      iv: iv,
      mode: _reactNativeCryptoJs.default.mode.CBC,
      padding: _reactNativeCryptoJs.default.pad.Pkcs7
    });
    return decrypted.toString(_reactNativeCryptoJs.default.enc.Utf8);
  };
