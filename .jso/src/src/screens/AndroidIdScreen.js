  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AndroidIdScreen = undefined;
  var _asyncToGenerator2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var _slicedToArray2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[2]));
  var _react = _interopRequireWildcard(_$$_REQUIRE(_dependencyMap[3]));
  var _reactNative = _$$_REQUIRE(_dependencyMap[4]);
  var _theme = _$$_REQUIRE(_dependencyMap[5]);
  var _globalVariables = _$$_REQUIRE(_dependencyMap[6]);
  var _clipboard = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[7]));
  var _utils = _$$_REQUIRE(_dependencyMap[8]);
  var _jsxRuntime = _$$_REQUIRE(_dependencyMap[9]);
  function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
  function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
  var OpencvFunc = _reactNative.NativeModules.OpencvFunc;
  var AndroidIdScreen = exports.AndroidIdScreen = function AndroidIdScreen() {
    var _useState = (0, _react.useState)(''),
      _useState2 = (0, _slicedToArray2.default)(_useState, 2),
      androidId = _useState2[0],
      setAndroidId = _useState2[1];
    (0, _react.useEffect)(function () {
      var fetchAndroidId = /*#__PURE__*/function () {
        var _ref = (0, _asyncToGenerator2.default)(function* () {
          try {
            var id = (yield OpencvFunc.getAndroidId()) + _globalVariables.sufix;
            setAndroidId((0, _utils.AESEncrypt)(id));
          } catch (error) {
            console.error('Error fetching Android ID:', error);
          }
        });
        return function fetchAndroidId() {
          return _ref.apply(this, arguments);
        };
      }();
      fetchAndroidId();
    }, []);
    var copyToClipboard = function copyToClipboard(androidId) {
      _reactNative.ToastAndroid.show('Copiado al portapapeles', _reactNative.ToastAndroid.SHORT);
      _clipboard.default.setString(androidId);
    };
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: styles.container,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        style: styles.text,
        children: "Id para soporte t\xE9cnico"
      }), androidId && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        style: {
          textAlign: 'center',
          fontSize: 16
        },
        children: androidId
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
        style: [styles.button, _theme.stylesTemplate.primaryColor],
        onPress: function onPress() {
          return copyToClipboard(androidId);
        },
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: styles.buttonText,
          children: "Copiar en el portapapeles"
        })
      })]
    });
  };
  var styles = _reactNative.StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 30,
      gap: 16,
      textAlign: 'center',
      backgroundColor: _theme.stylesTemplate.screenBgColor.backgroundColor
    },
    text: {
      fontSize: 20,
      textAlign: 'center'
    },
    button: {
      marginHorizontal: 12,
      paddingVertical: 12,
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
