  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.CameraScreen = undefined;
  var _asyncToGenerator2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var _slicedToArray2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[2]));
  var _react = _interopRequireWildcard(_$$_REQUIRE(_dependencyMap[3]));
  var _reactNative = _$$_REQUIRE(_dependencyMap[4]);
  var _utils = _$$_REQUIRE(_dependencyMap[5]);
  var _theme = _$$_REQUIRE(_dependencyMap[6]);
  var _reactNativeAdvancedCheckbox = _$$_REQUIRE(_dependencyMap[7]);
  var _globalVariables = _$$_REQUIRE(_dependencyMap[8]);
  var _ScanContext = _$$_REQUIRE(_dependencyMap[9]);
  var _jsxRuntime = _$$_REQUIRE(_dependencyMap[10]);
  function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
  function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
  var OpencvFunc = _reactNative.NativeModules.OpencvFunc,
    OpenCVWrapper = _reactNative.NativeModules.OpenCVWrapper;
  var _Dimensions$get = _reactNative.Dimensions.get('window'),
    height = _Dimensions$get.height;
  var CameraScreen = exports.CameraScreen = function CameraScreen(_ref) {
    var navigation = _ref.navigation,
      route = _ref.route;
    var roleLevel = route.params.roleLevel;
    var intervalRef = (0, _react.useRef)(null);
    var timerRef = (0, _react.useRef)(null);
    var lastScannedRef = (0, _react.useRef)(null); // Almacena el último QR escaneado
    var _useState = (0, _react.useState)([false, false, false]),
      _useState2 = (0, _slicedToArray2.default)(_useState, 2),
      checkBoxes = _useState2[0],
      setCheckBoxes = _useState2[1];
    var _useState3 = (0, _react.useState)([]),
      _useState4 = (0, _slicedToArray2.default)(_useState3, 2),
      services = _useState4[0],
      setServices = _useState4[1];
    var _useScanContext = (0, _ScanContext.useScanContext)(),
      setParts = _useScanContext.setParts,
      setPartsEdomex = _useScanContext.setPartsEdomex,
      parts = _useScanContext.parts,
      partsEdomex = _useScanContext.partsEdomex;

    // Solo para iOS: header personalizado por tema de la animación de la pantalla
    (0, _react.useEffect)(function () {
      if (_reactNative.Platform.OS === 'ios') {
        navigation.setOptions({
          headerLeft: function headerLeft() {
            return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
              style: {
                width: 'auto',
                height: '100%'
              },
              onPress: function onPress() {
                return navigation.goBack();
              },
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                style: styles.backButtonText,
                children: "Home"
              })
            });
          }
        });
      }
    }, [navigation]);
    (0, _react.useEffect)(function () {
      var onFocus = function onFocus() {
        var _getServices;
        setCheckBoxes([false, false, false]);
        setServices((_getServices = (0, _utils.getServices)()) != null ? _getServices : []);
        // Retrasar la apertura de la cámara para que la animación termine
        timerRef.current = setTimeout(/*#__PURE__*/(0, _asyncToGenerator2.default)(function* () {
          yield (0, _utils.openCamera)();
        }), 500); // Ajusta el tiempo según lo que necesites
      };
      var onBlur = /*#__PURE__*/function () {
        var _ref3 = (0, _asyncToGenerator2.default)(function* () {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
          yield (0, _utils.closeCamera)();
          lastScannedRef.current = null; // Reiniciar el último QR escaneado
        });
        return function onBlur() {
          return _ref3.apply(this, arguments);
        };
      }();
      var onBeforeRemove = /*#__PURE__*/function () {
        var _ref4 = (0, _asyncToGenerator2.default)(function* (e) {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
          yield (0, _utils.closeCamera)();
          setCheckBoxes([false, false, false]);
          lastScannedRef.current = null; // Reiniciar el último QR escaneado

          var action = e.data.action;
          if (action.type !== 'GO_BACK') {
            e.preventDefault();
            navigation.dispatch(action);
          }
        });
        return function onBeforeRemove(_x) {
          return _ref4.apply(this, arguments);
        };
      }();
      var unsubscribeFocus = navigation.addListener('focus', onFocus);
      var unsubscribeBlur = navigation.addListener('blur', onBlur);
      var unsubscribeBeforeRemove = navigation.addListener('beforeRemove', onBeforeRemove);
      var backHandler = _reactNative.BackHandler.addEventListener('hardwareBackPress', function () {
        navigation.goBack();
        return true;
      });
      return function () {
        unsubscribeFocus();
        unsubscribeBlur();
        unsubscribeBeforeRemove();
        backHandler.remove();
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [navigation]);
    var hasRear = !!services.find(function (service) {
      return service.has_rear === 1;
    });
    console.log('hasRear', hasRear);
    var hasFrontal = !!services.find(function (service) {
      return service.has_frontal === 1;
    });
    console.log('hasFrontal', hasFrontal);
    var hasEngomado = !!services.find(function (service) {
      return service.has_engomado === 1;
    });
    console.log('hasEngomado', hasEngomado);
    (0, _react.useEffect)(function () {
      var scanQRCode = /*#__PURE__*/function () {
        var _ref5 = (0, _asyncToGenerator2.default)(function* () {
          try {
            var res;
            if (_reactNative.Platform.OS === 'ios') {
              res = yield OpenCVWrapper.sendDecodedInfoToReact();
              console.log('TRAE algo res?', res);
            } else {
              res = yield OpencvFunc.sendDecodedInfoToReact();
            }
            if (res && res.length > 0) {
              // Si es un código nuevo (diferente al último escaneado)
              if (res !== lastScannedRef.current) {
                var pts;
                if (res.includes('XD')) {
                  _reactNative.Vibration.vibrate(100);
                  navigateToInformationScreen(res);
                }
                if (res.includes('|')) {
                  _reactNative.Vibration.vibrate(100);
                  pts = res.split('|');
                  //NOTE:Informacion hardcodeada para Edomex
                  setPartsEdomex({
                    url: 'https://edomex.gob.mx/',
                    folio: pts[0],
                    providerName: 'VIFINSA',
                    providerId: pts[1],
                    batchNumber: pts[2],
                    manufacturedYear: pts[3].slice(0, 2),
                    holo: '00',
                    semester: '2',
                    expirationDate: '2025',
                    serial: 'AAA-000-A'
                  });
                  console.log('parts*************:', JSON.stringify(pts));
                  lastScannedRef.current = res; // Actualiza el último código escaneado
                  navigateToInformationScreen();
                }
                //TODO: Oculto ya que esta rama (EDOMEX) no necesita escanera placas
                // else {
                //   pts = res.split('_');
                //   const serviceName = findServiceName(pts[5], pts[7]);
                //   let documents: string[] = [];
                //   if (hasFrontal) documents.push('Frontal');
                //   if (hasRear) documents.push('Trasera');
                //   if (hasEngomado) documents.push('Engomado');
                //   const updatedInfo: Parts = {
                //     version: pts[0],
                //     codeType: pts[1],
                //     chainLength: pts[2],
                //     permissionLevel: pts[3],
                //     serial: pts[4],
                //     typeServiceId: pts[5],
                //     typeServiceText: serviceName,
                //     state: pts[7],
                //     batch: pts[8],
                //     provider: pts[9],
                //     providerNumber: pts[10],
                //     expirationDate: pts[11],
                //     manufacturedYear: pts[12],
                //     url: pts[13],
                //     documents: documents,
                //   };
                //   setParts(updatedInfo);
                //   console.log('parts:', JSON.stringify(pts));
                //   console.log('updatedInfo:', JSON.stringify(updatedInfo));
                // }
              }
            }
          } catch (err) {
            console.error('Error escaneando QR:', err);
          }
        });
        return function scanQRCode() {
          return _ref5.apply(this, arguments);
        };
      }();
      intervalRef.current = setInterval(scanQRCode, 500);
      return function () {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [checkBoxes]);
    var navigateToInformationScreen = /*#__PURE__*/function () {
      var _ref6 = (0, _asyncToGenerator2.default)(function* (info) {
        yield (0, _utils.closeCamera)();
        navigation.navigate('InformationScreen', {
          roleLevel: roleLevel,
          info: info != null ? info : ''
        });
      });
      return function navigateToInformationScreen(_x2) {
        return _ref6.apply(this, arguments);
      };
    }();
    var checkboxesData = [{
      id: 1,
      label: 'Placa trasera identificada',
      isChecked: checkBoxes[0]
    }, {
      id: 2,
      label: 'Placa frontal identificada',
      isChecked: checkBoxes[1]
    }, {
      id: 3,
      label: 'Engomado identificado',
      isChecked: checkBoxes[2]
    }];
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: [styles.container, _theme.stylesTemplate.screenBgColor],
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        style: styles.void
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        style: {
          paddingHorizontal: 34,
          paddingVertical: 68,
          gap: 10
        },
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeAdvancedCheckbox.AdvancedCheckbox, {
          label: 'Escanear código',
          checkedColor: "#8F0F40",
          uncheckedColor: "#747272",
          size: 24
        })
      })]
    });
  };
  var styles = _reactNative.StyleSheet.create({
    container: {
      flex: 1
    },
    backButtonText: {
      fontSize: 18,
      color: 'blue'
    },
    void: {
      height: height / 2,
      width: '100%',
      backgroundColor: 'black'
    },
    scroll: {
      flexGrow: 1,
      justifyContent: 'flex-end',
      alignItems: 'center'
    }
  });
