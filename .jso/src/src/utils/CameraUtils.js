  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.openCamera = exports.closeCamera = undefined;
  var _asyncToGenerator2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var _reactNative = _$$_REQUIRE(_dependencyMap[2]);
  var OpencvFunc = _reactNative.NativeModules.OpencvFunc,
    OpenCVWrapper = _reactNative.NativeModules.OpenCVWrapper;
  var openCamera = exports.openCamera = /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2.default)(function* () {
      try {
        if (_reactNative.Platform.OS === 'android') {
          yield OpencvFunc.startCamera();
        } else {
          yield OpenCVWrapper.startCamera();
        }
      } catch (error) {
        console.error('Error al abrir la cámara:', error);
        throw error;
      }
    });
    return function openCamera() {
      return _ref.apply(this, arguments);
    };
  }();
  var closeCamera = exports.closeCamera = /*#__PURE__*/function () {
    var _ref2 = (0, _asyncToGenerator2.default)(function* () {
      try {
        if (_reactNative.Platform.OS === 'android') {
          yield OpencvFunc.stopCamera();
        } else {
          yield OpenCVWrapper.stopCamera();
        }
      } catch (error) {
        console.error('Error al cerrar la cámara:', error);
        throw error;
      }
    });
    return function closeCamera() {
      return _ref2.apply(this, arguments);
    };
  }();
