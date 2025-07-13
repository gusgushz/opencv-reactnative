  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _asyncToGenerator2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var postValidateToken = /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2.default)(function* (chain, token) {
      try {
        var response = yield fetch(`${"http://ec2-3-129-57-8.us-east-2.compute.amazonaws.com:3000"}/device/validate-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization_key: "value1",
            'auth-token': token
          },
          body: JSON.stringify({
            chain: chain
          })
        });

        // Si no hay respuesta válida
        if (!response || typeof response.json !== 'function') {
          console.error('Respuesta inválida o fetch falló');
          return {
            status: 'error',
            message: 'Error de red (sin response)'
          };
        }

        // Si el servidor responde pero con error HTTP (como 503)
        if (!response.ok) {
          return {
            status: 'error',
            message: 'Error HTTP',
            code: response.status
          };
        }
        var res;
        try {
          res = yield response.json();
        } catch (jsonError) {
          console.error('Error al parsear JSON:', jsonError);
          return {
            status: 'error',
            message: 'Respuesta no es JSON válida',
            detail: jsonError
          };
        }
        if (res.status === 'error') return res;
        return res;
      } catch (error) {
        console.error('Error postValidateToken:', error);
        return {
          status: 'error',
          message: 'Error de red',
          detail: error
        };
      }
    });
    return function postValidateToken(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
  var _default = exports.default = postValidateToken;
