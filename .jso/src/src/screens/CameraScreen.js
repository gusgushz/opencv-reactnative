  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.CameraScreen = undefined;
  var _toConsumableArray2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var _asyncToGenerator2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[2]));
  var _slicedToArray2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[3]));
  var _react = _interopRequireWildcard(_$$_REQUIRE(_dependencyMap[4]));
  var _reactNative = _$$_REQUIRE(_dependencyMap[5]);
  var _utils = _$$_REQUIRE(_dependencyMap[6]);
  var _theme = _$$_REQUIRE(_dependencyMap[7]);
  var _reactNativeAdvancedCheckbox = _$$_REQUIRE(_dependencyMap[8]);
  var _globalVariables = _$$_REQUIRE(_dependencyMap[9]);
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
              //NOTE: esto es para que solo funcione el codigo con una región(nombre del estado)
              if (_globalVariables.region == res.split('_')[7]) {
                if (res !== lastScannedRef.current) {
                  var _lastScannedRef$curre, _lastScannedRef$curre2;
                  _reactNative.Vibration.vibrate(100);
                  var parts = res.split('_');
                  var serviceName = findServiceName(parts[5], parts[7]);
                  var documents = [];
                  if (hasFrontal) documents.push('Frontal');
                  if (hasRear) documents.push('Trasera');
                  if (hasEngomado) documents.push('Engomado');
                  var updatedInfo = {
                    roleLevel: roleLevel,
                    version: parts[0],
                    codeType: parts[1],
                    chainLength: parts[2],
                    permissionLevel: parts[3],
                    serial: parts[4],
                    typeServiceId: parts[5],
                    typeServiceText: serviceName,
                    state: parts[7],
                    batch: parts[8],
                    provider: parts[9],
                    providerNumber: parts[10],
                    expirationDate: parts[11],
                    manufacturedYear: parts[12],
                    url: parts[13],
                    documents: documents
                  };
                  console.log('parts:', JSON.stringify(parts));
                  console.log('updatedInfo:', JSON.stringify(updatedInfo));
                  if (roleLevel == _globalVariables.RoleLevels.ZERO) {
                    navigateToInformationScreen(updatedInfo);
                  }
                  var newCheckBoxes = (0, _toConsumableArray2.default)(checkBoxes);
                  var isSamePlate = res.split('_')[4] === ((_lastScannedRef$curre = lastScannedRef.current) == null ? undefined : _lastScannedRef$curre.split('_')[4]);
                  console.log('lastScannedRef.current', (_lastScannedRef$curre2 = lastScannedRef.current) == null ? undefined : _lastScannedRef$curre2.split('_')[4]);
                  console.log('res', res.split('_')[4]);
                  console.log('isSamePlate', isSamePlate);
                  if (!isSamePlate) {
                    newCheckBoxes = [false, false, false];
                    setCheckBoxes(newCheckBoxes);
                  }
                  switch (updatedInfo.codeType) {
                    case 'Trasero':
                      newCheckBoxes[0] = true;
                      break;
                    case 'Delantero':
                      newCheckBoxes[1] = true;
                      break;
                    case 'Engomado':
                      newCheckBoxes[2] = true;
                      break;
                  }
                  setCheckBoxes(newCheckBoxes);
                  lastScannedRef.current = res; // Actualiza el último código escaneado

                  if ((newCheckBoxes[0] && newCheckBoxes[1] || newCheckBoxes[0] && newCheckBoxes[2] || newCheckBoxes[1] && newCheckBoxes[2]) && false) navigateToInformationScreen(updatedInfo);
                  if (hasRear && hasFrontal && hasEngomado) {
                    if (newCheckBoxes[0] && newCheckBoxes[1] && newCheckBoxes[2]) navigateToInformationScreen(updatedInfo);
                  }
                  if (hasRear && hasFrontal && !hasEngomado) {
                    if (newCheckBoxes[0] && newCheckBoxes[1]) navigateToInformationScreen(updatedInfo);
                  }
                  if (hasFrontal && !hasEngomado && !hasRear) {
                    if (newCheckBoxes[1]) navigateToInformationScreen(updatedInfo);
                  }
                  if (hasRear && !hasFrontal && !hasEngomado) {
                    if (newCheckBoxes[0]) navigateToInformationScreen(updatedInfo);
                  }
                }
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
    var findServiceName = function findServiceName(typeServiceId, state) {
      var _service$parent_servi;
      var stateId = (0, _globalVariables.stateNameToId)(state);
      var service = services.find(function (service) {
        return service.service_db_id.toString() === typeServiceId && service.state_id === stateId;
      });
      return (_service$parent_servi = service == null ? undefined : service.parent_service_name) != null ? _service$parent_servi : 'No se encontró el servicio';
    };
    var navigateToInformationScreen = /*#__PURE__*/function () {
      var _ref6 = (0, _asyncToGenerator2.default)(function* (parts) {
        yield (0, _utils.closeCamera)();
        console.log('Navigating to InformationScreen with parts:', parts);
        navigation.navigate('InformationScreen', {
          roleLevel: roleLevel,
          version: parts.version,
          codeType: parts.codeType,
          chainLength: parts.chainLength,
          permissionLevel: parts.permissionLevel,
          serial: parts.serial,
          typeServiceId: parts.typeServiceId,
          typeServiceText: parts.typeServiceText,
          state: parts.state,
          batch: parts.batch,
          provider: parts.provider,
          providerNumber: parts.providerNumber,
          expirationDate: parts.expirationDate,
          manufacturedYear: parts.manufacturedYear,
          url: parts.url,
          documents: parts.documents
        });

        // await closeCamera();
        // console.log('Navigating to InformationScreen with parts:', parts);
        // navigation.navigate('InformationScreen', {
        //   roleLevel: roleLevel,
        //   version: parts.version,
        //   codeType: parts.codeType,
        //   chainLength: parts.chainLength,
        //   permissionLevel: parts.permissionLevel,
        //   serial: parts.serial,
        //   typeServiceId: parts.typeServiceId,
        //   typeServiceText: parts.typeServiceText,
        //   state: parts.state,
        //   batch: parts.batch,
        //   provider: parts.provider,
        //   providerNumber: parts.providerNumber,
        //   expirationDate: parts.expirationDate,
        //   manufacturedYear: parts.manufacturedYear,
        //   url: parts.url,
        //   documents: parts.documents,
        // });
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
    //info[1] = "Delantero"  "Trasero"  "Engomado"

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
        children: checkboxesData.map(function (checkbox) {
          return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeAdvancedCheckbox.AdvancedCheckbox, {
            value: checkbox.isChecked,
            label: checkbox.label,
            checkedColor: "#8F0F40",
            uncheckedColor: "#747272",
            size: 24,
            checkBoxStyle: {
              borderRadius: 24
            },
            labelStyle: {
              color: checkbox.isChecked ? '#8F0F40' : '#747272'
            },
            animationType: "fade"
          }, checkbox.id);
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
      width: '100%'
      // backgroundColor: 'red',
    },
    scroll: {
      flexGrow: 1,
      justifyContent: 'flex-end',
      alignItems: 'center'
    }
  });
