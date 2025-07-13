  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.LoginScreenInputsAnim = undefined;
  var _slicedToArray2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var _react = _interopRequireWildcard(_$$_REQUIRE(_dependencyMap[2]));
  var _reactNative = _$$_REQUIRE(_dependencyMap[3]);
  var _theme = _$$_REQUIRE(_dependencyMap[4]);
  var _utils = _$$_REQUIRE(_dependencyMap[5]);
  var _UserContext = _$$_REQUIRE(_dependencyMap[6]);
  var _jsxRuntime = _$$_REQUIRE(_dependencyMap[7]);
  function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
  function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
  var LoginScreenInputsAnim = exports.LoginScreenInputsAnim = function LoginScreenInputsAnim(_ref) {
    var navigation = _ref.navigation;
    var _useUserContext = (0, _UserContext.useUserContext)(),
      setUser = _useUserContext.setUser,
      setUserSession = _useUserContext.setUserSession;
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
    var _useState9 = (0, _react.useState)(false),
      _useState10 = (0, _slicedToArray2.default)(_useState9, 2),
      emailFocused = _useState10[0],
      setEmailFocused = _useState10[1];
    var _useState11 = (0, _react.useState)(false),
      _useState12 = (0, _slicedToArray2.default)(_useState11, 2),
      passwordFocused = _useState12[0],
      setPasswordFocused = _useState12[1];
    var emailAnim = (0, _react.useRef)(new _reactNative.Animated.Value(email !== '' ? 1 : 0)).current;
    var passwordAnim = (0, _react.useRef)(new _reactNative.Animated.Value(password !== '' ? 1 : 0)).current;
    var animateLabel = function animateLabel(anim, toValue) {
      _reactNative.Animated.timing(anim, {
        toValue: toValue,
        duration: 200,
        useNativeDriver: false
      }).start();
    };
    var handleFocus = function handleFocus(setFocus, anim) {
      setFocus(true);
      animateLabel(anim, 1);
    };
    var handleBlur = function handleBlur(setFocus, anim, value) {
      setFocus(false);
      if (value === '') {
        animateLabel(anim, 0);
      }
    };
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
      setUserSession(userToSave);
      setUser(Object.assign({}, userToSave, {
        state_id: user.state_id
      }));
      setIsLoading(false);
      navigation.navigate('HomeScreen');
    };
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: [styles.container, _theme.stylesTemplate.screenBgColor],
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: {
          width: '100%',
          gap: 24
        },
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(AnimatedInput, {
          label: "Correo",
          value: email,
          onChangeText: setEmail,
          animValue: emailAnim,
          isFocused: emailFocused,
          onFocus: function onFocus() {
            return handleFocus(setEmailFocused, emailAnim);
          },
          onBlur: function onBlur() {
            return handleBlur(setEmailFocused, emailAnim, email);
          }
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(AnimatedInput, {
          label: "Contrase\xF1a",
          value: password,
          onChangeText: setPassword,
          animValue: passwordAnim,
          isFocused: passwordFocused,
          onFocus: function onFocus() {
            return handleFocus(setPasswordFocused, passwordAnim);
          },
          onBlur: function onBlur() {
            return handleBlur(setPasswordFocused, passwordAnim, password);
          },
          secureTextEntry: true
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
  var AnimatedInput = function AnimatedInput(_ref2) {
    var label = _ref2.label,
      value = _ref2.value,
      onChangeText = _ref2.onChangeText,
      animValue = _ref2.animValue,
      isFocused = _ref2.isFocused,
      onFocus = _ref2.onFocus,
      onBlur = _ref2.onBlur,
      _ref2$secureTextEntry = _ref2.secureTextEntry,
      secureTextEntry = _ref2$secureTextEntry === undefined ? false : _ref2$secureTextEntry;
    var inputRef = (0, _react.useRef)(null);
    var translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -20]
    });
    var fontSize = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 20]
    });
    var color = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#747474', _theme.stylesTemplate.primaryColor.backgroundColor]
    });
    var top = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 4]
    });
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableWithoutFeedback, {
      onPress: function onPress() {
        var _inputRef$current;
        return (_inputRef$current = inputRef.current) == null ? undefined : _inputRef$current.focus();
      },
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: styles.inputContainer,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Animated.Text, {
          style: [styles.placeholder, {
            transform: [{
              translateY: translateY
            }],
            position: 'absolute',
            left: 12,
            top: top,
            fontSize: fontSize,
            color: color
          }],
          children: label
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TextInput, {
          ref: inputRef,
          value: value,
          onChangeText: onChangeText,
          selectionColor: _theme.stylesTemplate.primaryColor.backgroundColor,
          style: styles.input,
          onFocus: onFocus,
          onBlur: onBlur,
          secureTextEntry: secureTextEntry,
          autoCapitalize: "none",
          autoCorrect: false
        })]
      })
    });
  };
  var styles = _reactNative.StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
      gap: 16
    },
    inputContainer: {
      width: '100%',
      position: 'relative'
    },
    input: {
      width: '100%',
      backgroundColor: '#DEDCDC',
      borderRadius: 5,
      paddingHorizontal: 24,
      color: 'black',
      paddingVertical: 16
    },
    placeholder: {
      zIndex: 1,
      backgroundColor: 'transparent',
      paddingHorizontal: 4
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
