  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _asyncToGenerator2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var serch = new URLSearchParams();
  var getChildServicesByState = /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2.default)(function* () {
      try {
        var response = yield fetch(`${"http://ec2-3-16-117-69.us-east-2.compute.amazonaws.com/api"}/getChildServicesByState`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            AuthorizationKey: "value1"
          }
        });
        var res = yield response.json();
        if (res.status === 'error') return res;
        return res;
      } catch (error) {
        console.error('Error getChildServicesByState:', error);
        return {
          status: 'error',
          message: 'Error de red',
          detail: error
        };
      }
    });
    return function getChildServicesByState() {
      return _ref.apply(this, arguments);
    };
  }();
  var _default = exports.default = getChildServicesByState;
