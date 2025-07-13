  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _asyncToGenerator2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var postAuthenticateDevice = /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2.default)(function* (chain) {
      try {
        var response = yield fetch(`${"http://ec2-3-129-57-8.us-east-2.compute.amazonaws.com:3000"}/device/authentication`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization_key: "value1"
            //"auth-token": authorization
          },
          body: JSON.stringify({
            chain: chain
          })
        });
        var res = yield response.json();
        if (res.status === 'error') return res;
        return res;
      } catch (error) {
        console.error('Error postAuthenticateDevice:', error);
        throw error;
      }
    });
    return function postAuthenticateDevice(_x) {
      return _ref.apply(this, arguments);
    };
  }();
  var _default = exports.default = postAuthenticateDevice;
