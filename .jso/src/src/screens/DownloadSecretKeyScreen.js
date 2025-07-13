  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.DownloadSecretKeyScreen = undefined;
  var _asyncToGenerator2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var _slicedToArray2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[2]));
  var _react = _interopRequireWildcard(_$$_REQUIRE(_dependencyMap[3]));
  var _reactNative = _$$_REQUIRE(_dependencyMap[4]);
  var _theme = _$$_REQUIRE(_dependencyMap[5]);
  var RNFS = _interopRequireWildcard(_$$_REQUIRE(_dependencyMap[6]));
  var _utils = _$$_REQUIRE(_dependencyMap[7]);
  var _jsxRuntime = _$$_REQUIRE(_dependencyMap[8]);
  function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
  function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
  var OpencvFunc = _reactNative.NativeModules.OpencvFunc;
  var DownloadSecretKeyScreen = exports.DownloadSecretKeyScreen = function DownloadSecretKeyScreen() {
    var _useState = (0, _react.useState)(''),
      _useState2 = (0, _slicedToArray2.default)(_useState, 2),
      url = _useState2[0],
      setUrl = _useState2[1];
    var _useState3 = (0, _react.useState)(false),
      _useState4 = (0, _slicedToArray2.default)(_useState3, 2),
      exists = _useState4[0],
      setExists = _useState4[1];
    var _useState5 = (0, _react.useState)(false),
      _useState6 = (0, _slicedToArray2.default)(_useState5, 2),
      isLoading = _useState6[0],
      setIsLoading = _useState6[1];
    var _useState7 = (0, _react.useState)(''),
      _useState8 = (0, _slicedToArray2.default)(_useState7, 2),
      warning = _useState8[0],
      setWarning = _useState8[1];
    (0, _react.useEffect)(function () {
      var checkFileExists = /*#__PURE__*/function () {
        var _ref = (0, _asyncToGenerator2.default)(function* () {
          try {
            var fileExists = yield RNFS.exists(`${RNFS.ExternalDirectoryPath}/secretKey.dat`);
            setExists(fileExists);
          } catch (error) {
            console.error('Error checking file existence:', error);
          }
        });
        return function checkFileExists() {
          return _ref.apply(this, arguments);
        };
      }();
      checkFileExists();
    }, [exists]);
    var handleDownload = /*#__PURE__*/function () {
      var _ref2 = (0, _asyncToGenerator2.default)(function* () {
        if (!url || isLoading || exists) return;
        setIsLoading(true);
        setWarning('');
        try {
          var processedUrl = url.trim(); // Limpiar espacios
          if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
            processedUrl = 'http://' + processedUrl; //FIXME: cambiar el prefijo a https://
          }
          processedUrl = processedUrl.replace('https://', 'http://'); //FIXME: eliminar cuando ya se corrija el backend
          console.log('URL de descarga:', processedUrl);
          var downloadResult = yield RNFS.downloadFile({
            fromUrl: processedUrl,
            toFile: `${RNFS.ExternalDirectoryPath}/secretKey.dat`
          }).promise;
          if (downloadResult.statusCode === 200) {
            var _exists = yield RNFS.exists(`${RNFS.ExternalDirectoryPath}/secretKey.dat`);
            if (_exists) {
              setWarning('Clave Descargada');
              var content = yield RNFS.readFile(`${RNFS.ExternalDirectoryPath}/secretKey.dat`, 'utf8');
              var keyDecoded = (0, _utils.base64Decode)(content);
              (0, _utils.removeToken)();
              (0, _utils.storeKey)(keyDecoded);
              setExists(true);
              console.log('Clave descargada:', keyDecoded);
              yield OpencvFunc.exitAppWithMessage('Clave descargada. Volver a abrir la aplicación para continuar.');
            }
          } else {
            setWarning('Error al descargar la clave. Verifique la URL.');
          }
        } catch (error) {
          console.error('Download error:', error);
          setWarning('Error al descargar la clave. Verifique la URL.');
        } finally {
          setIsLoading(false);
        }
      });
      return function handleDownload() {
        return _ref2.apply(this, arguments);
      };
    }();
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: [styles.container, _theme.stylesTemplate.screenBgColor],
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
        source: _$$_REQUIRE(_dependencyMap[9]),
        resizeMode: "center",
        style: {
          marginBottom: -16
        }
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TextInput, {
        style: styles.input,
        value: url,
        onChangeText: setUrl,
        placeholder: "Ingrese su clave secreta",
        placeholderTextColor: "#888",
        autoCapitalize: "none",
        selectionColor: '#D9D9D9',
        cursorColor: _theme.stylesTemplate.primaryColor.backgroundColor,
        selectionHandleColor: _theme.stylesTemplate.primaryColor.backgroundColor
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
        disabled: exists || isLoading || url === '',
        style: exists || isLoading || url === '' ? styles.button : [styles.button, _theme.stylesTemplate.primaryColor],
        onPress: handleDownload,
        children: isLoading ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.ActivityIndicator, {
          size: 'small',
          color: "#fff"
        }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: styles.buttonText,
          children: exists ? 'Clave descargada' : 'Descargar clave'
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        style: {
          color: exists ? 'blue' : 'red'
        },
        children: warning
      })]
    });
  };
  var styles = _reactNative.StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 16,
      alignItems: 'center',
      paddingHorizontal: 30
    },
    input: {
      width: '80%',
      padding: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      marginBottom: 20,
      backgroundColor: '#fff'
    },
    button: {
      marginHorizontal: 12,
      paddingVertical: 12,
      paddingHorizontal: 48,
      backgroundColor: '#4A4546',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 5
    },
    buttonText: {
      textAlign: 'center',
      fontSize: 15,
      color: '#fff'
    }
  });
