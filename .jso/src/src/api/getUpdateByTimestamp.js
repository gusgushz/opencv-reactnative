  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _asyncToGenerator2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var getUpdateByTimestamp = /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2.default)(function* (stateId, lastUpdated) {
      try {
        var lastUpdatedDefault = '2000-05-15 20:23:41';
        var response = yield fetch(`${"http://ec2-3-16-117-69.us-east-2.compute.amazonaws.com/api"}/updateByTimestamp?` + new URLSearchParams({
          state_id: stateId,
          lastUpdated: lastUpdated != null ? lastUpdated : lastUpdatedDefault
        }).toString(), {
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
        console.error('Error getUpdateByTimestamp:', error);
        return {
          status: 'error',
          message: 'Error de red',
          detail: error
        };
      }
    });
    return function getUpdateByTimestamp(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
  var _default = exports.default = getUpdateByTimestamp;
