  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.HomeScreen = undefined;
  var _slicedToArray2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var _react = _interopRequireWildcard(_$$_REQUIRE(_dependencyMap[2]));
  var _reactNative = _$$_REQUIRE(_dependencyMap[3]);
  var _theme = _$$_REQUIRE(_dependencyMap[4]);
  var _globalVariables = _$$_REQUIRE(_dependencyMap[5]);
  var _utils = _$$_REQUIRE(_dependencyMap[6]);
  var _native = _$$_REQUIRE(_dependencyMap[7]);
  var _jsxRuntime = _$$_REQUIRE(_dependencyMap[8]);
  function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
  function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
  // import { useUserContext } from '../contexts/UserContext.tsx';

  var _Dimensions$get = _reactNative.Dimensions.get('window'),
    height = _Dimensions$get.height;
  var HomeScreen = exports.HomeScreen = function HomeScreen(_ref) {
    var navigation = _ref.navigation;
    // const { setUser, setUserSession, userSession } = useUserContext();
    var _useState = (0, _react.useState)(0),
      _useState2 = (0, _slicedToArray2.default)(_useState, 2),
      count = _useState2[0],
      setCount = _useState2[1];
    var _useState3 = (0, _react.useState)((0, _utils.getUserSession)()),
      _useState4 = (0, _slicedToArray2.default)(_useState3, 2),
      userSession = _useState4[0],
      setUserSession = _useState4[1];
    var isFocused = (0, _native.useIsFocused)();
    (0, _react.useEffect)(function () {
      if (!userSession) {
        {
          var Session = (0, _utils.getUserSession)();
          if (Session) setUserSession(Session);
        }
      }
    }, [isFocused]);
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: [styles.container, _theme.stylesTemplate.screenBgColor],
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableWithoutFeedback, {
        onPress: function onPress() {},
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
          source: _$$_REQUIRE(_dependencyMap[9]),
          resizeMode: "center",
          style: {
            width: '100%',
            height: height * 0.3
          }
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: styles.buttonsContainer,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
          onPress: function onPress() {
            if (userSession) {
              navigation.navigate('CameraScreen', {
                roleLevel: userSession.role
              });
            } else {
              navigation.navigate('CameraScreen', {
                roleLevel: _globalVariables.RoleLevels.ZERO
              });
            }
          },
          style: [styles.button, _theme.stylesTemplate.primaryColor],
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.buttonText,
            children: "Escanear c\xF3digo"
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_jsxRuntime.Fragment, {
          children: userSession ? /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
              onPress: function onPress() {
                navigation.navigate('ProfileScreen');
              },
              style: [styles.button, _theme.stylesTemplate.primaryColor],
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                style: styles.buttonText,
                children: "Perfil"
              })
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
              onPress: function onPress() {
                (0, _utils.removeUserSession)();
                (0, _utils.removeUser)();
                setUserSession(null);
              },
              style: [styles.button, _theme.stylesTemplate.primaryColor],
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                style: styles.buttonText,
                children: "Cerrar sesi\xF3n"
              })
            })]
          }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
            onPress: function onPress() {
              navigation.navigate('LoginScreen');
            },
            style: [styles.button, _theme.stylesTemplate.primaryColor],
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.buttonText,
              children: "Iniciar sesi\xF3n"
            })
          })
        })]
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
    buttonsContainer: {
      width: '100%',
      gap: 10
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
    },
    text: {
      fontSize: 20,
      color: 'black'
    }
  });
