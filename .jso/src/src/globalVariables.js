  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.sufix = exports.stateNameToId = exports.region = exports.RoleLevels = undefined;
  var _app = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var RoleLevels = exports.RoleLevels = /*#__PURE__*/function (RoleLevels) {
    RoleLevels["ZERO"] = "1";
    RoleLevels["ONE"] = "2";
    RoleLevels["TWO"] = "3";
    RoleLevels["THREE"] = "4";
    return RoleLevels;
  }({});
  var sufix = exports.sufix = 'CHP003';
  var region = exports.region = _app.default.Regions[0].Name.toUpperCase();
  var stateNameToId = exports.stateNameToId = function stateNameToId(state) {
    if (state === region) {
      console.log('Region found:', state === region);
      return parseInt(_app.default.Regions[0].Id);
    } else {
      return -1;
    }
  };
