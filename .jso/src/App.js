  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = undefined;
  var _asyncToGenerator2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var _react = _interopRequireWildcard(_$$_REQUIRE(_dependencyMap[2]));
  var _native = _$$_REQUIRE(_dependencyMap[3]);
  var _nativeStack = _$$_REQUIRE(_dependencyMap[4]);
  var _reactNative = _$$_REQUIRE(_dependencyMap[5]);
  var _reactNativeBootsplash = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[6]));
  var _screens = _$$_REQUIRE(_dependencyMap[7]);
  var _utils = _$$_REQUIRE(_dependencyMap[8]);
  var _app = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[9]));
  var RNFS = _interopRequireWildcard(_$$_REQUIRE(_dependencyMap[10]));
  var _api = _$$_REQUIRE(_dependencyMap[11]);
  var _ScanContext = _$$_REQUIRE(_dependencyMap[12]);
  var _globalVariables = _$$_REQUIRE(_dependencyMap[13]);
  var Sentry = _interopRequireWildcard(_$$_REQUIRE(_dependencyMap[14]));
  var _jsxRuntime = _$$_REQUIRE(_dependencyMap[15]);
  function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
  function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
  var OpenCVWrapper = _reactNative.NativeModules.OpenCVWrapper,
    OpencvFunc = _reactNative.NativeModules.OpencvFunc;

  //prettier-ignore

  //prettier-ignore

  //prettier-ignore

  // import { UserProvider } from './src/contexts/UserContext.tsx';

  Sentry.init({
    dsn: 'https://86a8a5548583da54c5af87a58acf940a@o1412274.ingest.us.sentry.io/4508937809362944'
  });
  function App() {
    var requestPermissions = /*#__PURE__*/function () {
      var _ref = (0, _asyncToGenerator2.default)(function* () {
        try {
          if (_reactNative.Platform.OS === 'android') {
            var cameraPermission = yield _reactNative.PermissionsAndroid.request(_reactNative.PermissionsAndroid.PERMISSIONS.CAMERA);
            var readFilePermission = yield _reactNative.PermissionsAndroid.request(_reactNative.PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
            var writeFilePermission = yield _reactNative.PermissionsAndroid.request(_reactNative.PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
            if (cameraPermission !== _reactNative.PermissionsAndroid.RESULTS.GRANTED && readFilePermission !== _reactNative.PermissionsAndroid.RESULTS.GRANTED && writeFilePermission !== _reactNative.PermissionsAndroid.RESULTS.GRANTED) {
              console.warn('Permiso de cámara denegado en Android o Permiso de cámara o lectura de archivos denegado en Android o Permiso de cámara o lectura de archivos denegado en Android');
              return;
            }
          } else {
            var _cameraPermission = yield OpenCVWrapper.checkCameraPermission();
            console.log('Permiso de cámara en iOS:', _cameraPermission);
            if (_cameraPermission !== 'granted') {
              yield OpenCVWrapper.requestCameraPermission();
            }
          }
        } catch (err) {
          console.warn('Error solicitando permisos:', err);
        }
      });
      return function requestPermissions() {
        return _ref.apply(this, arguments);
      };
    }();
    var init = /*#__PURE__*/function () {
      var _ref2 = (0, _asyncToGenerator2.default)(function* () {
        var isPermissionGranted = false;
        var serv = (0, _utils.getServices)();
        if (!serv) {
          var services = yield (0, _api.getChildServicesByState)();
          if (services.status !== 'error') (0, _utils.storeServices)(services.data);
        }
        console.log('SECURITY_LEVEL actual:', "private");
        {
          var exists = yield RNFS.exists(`${RNFS.ExternalDirectoryPath}/secretKey.dat`);
          console.log('exists', exists);
          //removeToken();
          if (exists) {
            var _getToken, _getKey;
            var androidId = (yield OpencvFunc.getAndroidId()) + _globalVariables.sufix;
            var token = (_getToken = (0, _utils.getToken)()) != null ? _getToken : '';
            var content = yield RNFS.readFile(`${RNFS.ExternalDirectoryPath}/secretKey.dat`, 'utf8');
            var keyDecoded = (0, _utils.base64Decode)(content);
            var key = (_getKey = (0, _utils.getKey)()) != null ? _getKey : '';
            var chain = (0, _utils.base64Encode)(key + '.' + androidId);
            var today = new Date();
            console.log('androidId', androidId);
            console.log('token', token);
            console.log('content', content);
            console.log('keyDecoded', keyDecoded);
            console.log('chain', chain);
            if (token != '') {
              if (key === keyDecoded) {
                console.log(key === keyDecoded);
                var dateRaw = (0, _utils.getLastValidateTokenDate)();
                console.log('dateRaw', dateRaw);
                var date = dateRaw ? new Date(dateRaw) : null;
                console.log('date', date);
                var response = yield (0, _api.postValidateToken)(chain, token);
                console.log('response postValidateToken', response);
                if (response.status === 'error' && response.message === 'Error de red') {
                  if (date) {
                    console.log('getLastValidateTokenDate', date.toLocaleDateString());
                    var daysDifference = (today.getTime() - date.getTime()) / 86400000;
                    (0, _utils.storeDaysDifference)(daysDifference);
                    if (daysDifference <= 7) {
                      console.log('diferencia de días', daysDifference);
                      isPermissionGranted = true;
                      return;
                    }
                  }
                  yield OpencvFunc.exitAppWithMessage('Necesita conectarse a internet para validar su sesión. Cerrando la aplicación...');
                  return;
                }
                if (response.status === 'success') {
                  (0, _utils.storeLastValidateTokenDate)(today);
                  isPermissionGranted = true;
                  return;
                }
              }
            } else {
              console.log('No hay token, se procede a registrar la clave');
              var isKeyRegistered = false;
              var isKeyAlreadyRegistered = false;
              var _response = yield (0, _api.postKeyActivation)(androidId, keyDecoded);
              console.log('response postKeyActivation', _response);
              if (_response.status === 'error') {
                if (_response.data == 'key is already active') isKeyAlreadyRegistered = true;
              }
              if (_response.status === 'success') isKeyRegistered = true;
              if (isKeyAlreadyRegistered) {
                // console.log('isKeyAlreadyRegistered****', chain);
                // const res = await getRecoverToken(chain);
                // console.log('res isKeyAlreadyRegistered', res);
                // if (res.status === 'success') {
                //   storeLastValidateTokenDate(today);
                //   storeToken(res.authToken);
                //   isPermissionGranted = true;
                //   return;
                // }
                console.log('isKeyAlreadyRegistered**FALTA EL ENDPOINT PARA RECUPERARTOKEN', isKeyAlreadyRegistered);
                (0, _utils.storeLastValidateTokenDate)(today);
                isPermissionGranted = true; //FIXME: se dejo en true para pruebas
              }
              if (isKeyRegistered) {
                var res = yield (0, _api.postAuthenticateDevice)(chain);
                console.log('res isKeyRegistered****', res);
                console.log('res isKeyRegistered res.authToken****', res.authToken);
                if (res.status === 'success') {
                  (0, _utils.storeLastValidateTokenDate)(today);
                  (0, _utils.storeToken)(res.authToken);
                  isPermissionGranted = true;
                  return;
                }
              }
            }
          } else {
            isPermissionGranted = true;
            return;
          }
          console.log('isPermissionGranted', isPermissionGranted);
          if (!isPermissionGranted) yield OpencvFunc.exitAppWithMessage('Permisos denegados. Cerrando la aplicación...');
        }
      });
      return function init() {
        return _ref2.apply(this, arguments);
      };
    }();
    (0, _react.useEffect)(function () {
      var initializeApp = /*#__PURE__*/function () {
        var _ref3 = (0, _asyncToGenerator2.default)(function* () {
          yield requestPermissions();
          yield init();
          yield _reactNativeBootsplash.default.hide({
            fade: true
          });
          console.log('BootSplash has been hidden successfully');
        });
        return function initializeApp() {
          return _ref3.apply(this, arguments);
        };
      }();
      initializeApp();
    }, []);
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_ScanContext.ScanContextProvider, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.StatusBar, {
        hidden: true
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.SafeAreaView, {
        style: styles.ios,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(MyStack, {})
      })]
    });
  }
  var styles = _reactNative.StyleSheet.create({
    ios: {
      flex: 1
    }
  });
  var _default = exports.default = Sentry.wrap(App);
  var Stack = (0, _nativeStack.createNativeStackNavigator)();
  var MyStack = function MyStack() {
    var _getKey2;
    var exists = false;
    var key = (_getKey2 = (0, _utils.getKey)()) != null ? _getKey2 : '';
    if (key !== '') exists = true;
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_native.NavigationContainer, {
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(Stack.Navigator, {
        initialRouteName: !exists ? 'DownloadSecretKeyScreen' : 'HomeScreen'
        //NOTE:
        // initialRouteName="CameraTestScreen"
        ,
        screenOptions: {
          headerTitleAlign: 'center',
          headerTintColor: '#737373'
        },
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(Stack.Screen, {
          name: "CameraTestScreen",
          component: _screens.CameraTestScreen,
          options: {
            headerShown: true
          }
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Stack.Screen, {
          name: "HomeScreen",
          component: _screens.HomeScreen,
          options: {
            headerShown: false
          }
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Stack.Screen, {
          name: "CameraScreen",
          component: _screens.CameraScreen,
          options: {
            headerShown: true,
            headerTitle: 'Escanear código'
          }
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Stack.Screen, {
          name: "InformationScreen",
          component: _screens.InformationScreen,
          options: {
            headerShown: true,
            headerTitle: 'Información'
          }
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Stack.Screen, {
          name: "ProfileScreen",
          component: _screens.ProfileScreen,
          options: {
            headerShown: true,
            headerTitle: 'Perfil'
          }
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Stack.Screen, {
          name: "LoginScreen",
          component: _screens.LoginScreen,
          options: {
            headerShown: true,
            headerTitle: 'Iniciar sesión'
          }
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Stack.Screen, {
          name: "InfractionsScreen",
          component: _screens.InfractionsScreen,
          options: {
            headerShown: true,
            headerTitle: 'Infracciones'
          }
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Stack.Screen, {
          name: "DownloadSecretKeyScreen",
          component: _screens.DownloadSecretKeyScreen,
          options: {
            headerShown: false,
            headerTitle: 'Infracciones'
          }
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Stack.Screen, {
          name: "AndroidIdScreen",
          component: _screens.AndroidIdScreen,
          options: {
            headerShown: true,
            headerTitle: 'Soporte técnico'
          }
        })]
      })
    });
  };
