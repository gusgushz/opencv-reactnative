  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.stylesTemplate = undefined;
  var _reactNative = _$$_REQUIRE(_dependencyMap[1]);
  var _theme = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[2]));
  var stylesTemplate = exports.stylesTemplate = _reactNative.StyleSheet.create({
    screenBgColor: {
      backgroundColor: _theme.default.backgroundColor
    },
    primaryColor: {
      backgroundColor: _theme.default.primaryColor
    }
  });
