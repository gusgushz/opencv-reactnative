  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.LoginScreen = undefined;
  var _slicedToArray2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var _react = _interopRequireWildcard(_$$_REQUIRE(_dependencyMap[2]));
  var _reactNative = _$$_REQUIRE(_dependencyMap[3]);
  var _theme = _$$_REQUIRE(_dependencyMap[4]);
  var _utils = _$$_REQUIRE(_dependencyMap[5]);
  var _jsxRuntime = _$$_REQUIRE(_dependencyMap[6]);
  function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
  function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
  // import { useUserContext } from '../contexts/UserContext.tsx';

  var _Dimensions$get = _reactNative.Dimensions.get('window'),
    height = _Dimensions$get.height;
  var LoginScreen = exports.LoginScreen = function LoginScreen(_ref) {
    var navigation = _ref.navigation;
    // const { setUser, setUserSession } = useUserContext();
    var _useState = (0, _react.useState)(''),
      _useState2 = (0, _slicedToArray2.default)(_useState, 2),
      email = _useState2[0],
      setEmail = _useState2[1];
    var _useState3 = (0, _react.useState)(''),
      _useState4 = (0, _slicedToArray2.default)(_useState3, 2),
      password = _useState4[0],
      setPassword = _useState4[1];
    var _useState5 = (0, _react.useState)(false),
      _useState6 = (0, _slicedToArray2.default)(_useState5, 2),
      isLoading = _useState6[0],
      setIsLoading = _useState6[1];
    var _useState7 = (0, _react.useState)(''),
      _useState8 = (0, _slicedToArray2.default)(_useState7, 2),
      warning = _useState8[0],
      setWarning = _useState8[1];
    var handleLogin = function handleLogin() {
      setIsLoading(true);
      if (!email || !password) {
        setIsLoading(false);
        return setWarning('Por favor, completa todos los campos.');
      }
      var usersData = (0, _utils.getUsersData)();
      if (!usersData) {
        setIsLoading(false);
        return setWarning('No hay datos de usuarios disponibles.');
      }
      var user = usersData.created.find(function (user) {
        return user.email === email.toLowerCase().trim() && (0, _utils.readableString)(user.password) === password.trim();
      });
      if (!user) {
        setIsLoading(false);
        return setWarning('Correo o contraseña incorrectos.');
      }
      var userToSave = {
        email: user.email,
        name: user.name,
        role: user.role
      };
      setWarning('');
      (0, _utils.storeUserSession)(userToSave);
      (0, _utils.storeUser)(Object.assign({}, userToSave, {
        state_id: user.state_id
      }));
      setIsLoading(false);
      navigation.goBack();
    };
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.KeyboardAvoidingView, {
      behavior: _reactNative.Platform.OS === 'ios' ? 'padding' : 'height',
      style: [styles.container, _theme.stylesTemplate.screenBgColor],
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: {
          width: '100%',
          gap: 24
        },
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
          source: _$$_REQUIRE(_dependencyMap[7]),
          resizeMode: "center",
          style: {
            width: '100%',
            height: height * 0.2
          }
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: {
            gap: 4
          },
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.title,
            children: "Correo"
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TextInput, {
            placeholder: "Correo",
            placeholderTextColor: '#747474',
            value: email,
            onChangeText: setEmail,
            selectionColor: _theme.stylesTemplate.primaryColor.backgroundColor,
            style: styles.input
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: {
            gap: 4
          },
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.title,
            children: "Contrase\xF1a"
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TextInput, {
            placeholder: "Contrase\xF1a",
            placeholderTextColor: '#747474',
            value: password,
            onChangeText: setPassword,
            secureTextEntry: true,
            selectionColor: _theme.stylesTemplate.primaryColor.backgroundColor,
            style: styles.input,
            autoCapitalize: "none",
            autoCorrect: false
          })]
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
        style: styles.button,
        disabled: isLoading,
        onPress: handleLogin,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: styles.buttonText,
          children: "Iniciar sesi\xF3n"
        })
      }), warning ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        style: {
          color: 'red'
        },
        children: warning
      }) : null]
    });
  };
  var styles = _reactNative.StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: 30,
      gap: 16,
      paddingBottom: 50
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: _theme.stylesTemplate.primaryColor.backgroundColor
    },
    inputContainer: {
      width: '100%'
      //position: 'relative',
    },
    input: {
      width: '100%',
      backgroundColor: '#DEDCDC',
      borderRadius: 5,
      paddingHorizontal: 24,
      color: 'black',
      paddingVertical: 16
    },
    button: {
      marginHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: _theme.stylesTemplate.primaryColor.backgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 5,
      width: '60%'
    },
    buttonText: {
      textAlign: 'center',
      fontSize: 15,
      color: '#fff'
    }
  });
