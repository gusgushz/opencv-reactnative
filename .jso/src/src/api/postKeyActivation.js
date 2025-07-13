  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _asyncToGenerator2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var postKeyActivation = /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2.default)(function* (androidId, key) {
      try {
        var response = yield fetch(`${"http://ec2-3-16-117-69.us-east-2.compute.amazonaws.com/api"}/key/activation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            AuthorizationKey: "value1"
            //"auth-token": authorization
          },
          body: JSON.stringify({
            imei: androidId,
            key: key
          })
        });
        var res = yield response.json();
        if (res.status === 'error') return res;
        return res;
      } catch (error) {
        console.error('Error postKeyActivation:', error);
        throw error;
      }
    });
    return function postKeyActivation(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
  var _default = exports.default = postKeyActivation;
