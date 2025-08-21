  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _asyncToGenerator2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var postAuthenticateValidDevice = /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2.default)(function* (androidId, key) {
      try {
        var response = yield fetch(`${"http://ec2-3-129-57-8.us-east-2.compute.amazonaws.com:3333"}/authenticate-device`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': "MKzGBC1rx9pFzhi7RWhiQ9A5KgYz32IHnmvKXSxTVEFWHsHESn"
          },
          body: JSON.stringify({
            device_id: androidId,
            key: key
          })
        });
        var res = yield response.json();
        if (res.status === 'error') return res;
        return res;
      } catch (error) {
        console.error('Error postAuthenticateDevice:', error);
        return {
          status: 'error',
          message: 'Error de red',
          detail: error
        };
      }
    });
    return function postAuthenticateValidDevice(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
  var _default = exports.default = postAuthenticateValidDevice;
