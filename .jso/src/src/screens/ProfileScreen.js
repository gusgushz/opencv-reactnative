  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ProfileScreen = undefined;
  var _reactNative = _$$_REQUIRE(_dependencyMap[0]);
  var _theme = _$$_REQUIRE(_dependencyMap[1]);
  var _utils = _$$_REQUIRE(_dependencyMap[2]);
  var _jsxRuntime = _$$_REQUIRE(_dependencyMap[3]);
  // import { useUserContext } from '../contexts/UserContext.tsx';

  var ProfileScreen = exports.ProfileScreen = function ProfileScreen(_ref) {
    var navigation = _ref.navigation;
    // const { user } = useUserContext();
    var user = (0, _utils.getUser)();
    if (!user) return null;
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: [{
        padding: 20,
        flex: 1
      }, _theme.stylesTemplate.screenBgColor],
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: [styles.container, _theme.stylesTemplate.primaryColor],
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: styles.title,
          children: "Nombre de usuario:"
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: styles.text,
          children: user.name
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: styles.title,
          children: "Nivel de permiso:"
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: styles.text,
          children: user.role
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: styles.title,
          children: "Correo:"
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: styles.text,
          children: user.email
        })]
      })
    });
  };
  var styles = _reactNative.StyleSheet.create({
    container: {
      padding: 24,
      borderRadius: 8,
      marginVertical: 10,
      gap: 4,
      paddingBlock: 20
    },
    title: {
      fontSize: 15,
      fontWeight: 'bold',
      color: 'white'
    },
    text: {
      color: 'white',
      paddingLeft: 12
    }
  });
