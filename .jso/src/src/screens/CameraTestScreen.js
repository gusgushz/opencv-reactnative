  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.CameraTestScreen = undefined;
  var _reactNative = _$$_REQUIRE(_dependencyMap[0]);
  var _jsxRuntime = _$$_REQUIRE(_dependencyMap[1]);
  var CameraTestScreen = exports.CameraTestScreen = function CameraTestScreen(_ref) {
    var navigation = _ref.navigation;
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: styles.container,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
        style: {
          backgroundColor: 'lightblue',
          paddingHorizontal: 24,
          paddingVertical: 12,
          elevation: 4
        },
        onPress: function onPress() {
          return navigation.navigate('CameraScreen', {
            roleLevel: '4'
          });
        },
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          children: "CameraTestScreen"
        })
      })
    });
  };
  var styles = _reactNative.StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }
  });
