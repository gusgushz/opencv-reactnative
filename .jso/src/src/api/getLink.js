  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _asyncToGenerator2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var getLink = /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2.default)(function* (shortURL) {
      var slashTag = shortURL.split('.')[1];
      var urlToFetch = `${"https://api.rebrandly.com/v1"}/links?slashtag=${slashTag}&domain[id]=${"8f104cc5b6ee4a4ba7897b06ac2ddcfb"}`;
      try {
        var response = yield fetch(urlToFetch, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            apikey: "80af086a07f940039e5481a5731e2420"
          }
        });
        if (response.status !== 200) return 'Hubo un error al obtener la URL';
        var urls = yield response.json();
        var url = urls.find(function (url) {
          return url.slashtag === slashTag;
        });
        if (!url) return 'Url no existe';
        return url.destination;
      } catch (error) {
        console.error('Error in getAllLinks:', error);
        return 'Hubo un error al obtener la URL';
      }
    });
    return function getLink(_x) {
      return _ref.apply(this, arguments);
    };
  }();
  var _default = exports.default = getLink;
