  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.InfractionsScreen = undefined;
  var _react = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var _reactNative = _$$_REQUIRE(_dependencyMap[2]);
  var _theme = _$$_REQUIRE(_dependencyMap[3]);
  var _jsxRuntime = _$$_REQUIRE(_dependencyMap[4]);
  var InfractionsScreen = exports.InfractionsScreen = function InfractionsScreen() {
    var _useWindowDimensions = (0, _reactNative.useWindowDimensions)(),
      height = _useWindowDimensions.height;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: [styles.containerNoInfo, {
        paddingTop: height / 3
      }],
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
        source: _$$_REQUIRE(_dependencyMap[5]),
        resizeMode: "contain",
        style: {
          width: '30%'
        }
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        style: styles.text,
        children: "Sin infracciones"
      })]
    });
  };
  var styles = _reactNative.StyleSheet.create({
    containerNoInfo: {
      flex: 1,
      paddingHorizontal: 30,
      backgroundColor: _theme.stylesTemplate.screenBgColor.backgroundColor,
      alignItems: 'center',
      gap: 8
    },
    text: {
      textAlign: 'center',
      fontSize: 17
    }
  });
