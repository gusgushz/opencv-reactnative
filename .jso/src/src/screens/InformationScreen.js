  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.InformationScreen = undefined;
  var _asyncToGenerator2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var _slicedToArray2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[2]));
  var _react = _interopRequireWildcard(_$$_REQUIRE(_dependencyMap[3]));
  var _reactNative = _$$_REQUIRE(_dependencyMap[4]);
  var _theme = _$$_REQUIRE(_dependencyMap[5]);
  var _globalVariables = _$$_REQUIRE(_dependencyMap[6]);
  var _api = _$$_REQUIRE(_dependencyMap[7]);
  var _jsxRuntime = _$$_REQUIRE(_dependencyMap[8]);
  function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
  function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
  var InformationScreen = exports.InformationScreen = function InformationScreen(_ref) {
    var route = _ref.route,
      navigation = _ref.navigation;
    var _route$params = route.params,
      roleLevel = _route$params.roleLevel,
      version = _route$params.version,
      codeType = _route$params.codeType,
      chainLength = _route$params.chainLength,
      permissionLevel = _route$params.permissionLevel,
      serial = _route$params.serial,
      typeServiceId = _route$params.typeServiceId,
      typeServiceText = _route$params.typeServiceText,
      state = _route$params.state,
      batch = _route$params.batch,
      provider = _route$params.provider,
      providerNumber = _route$params.providerNumber,
      expirationDate = _route$params.expirationDate,
      manufacturedYear = _route$params.manufacturedYear,
      url = _route$params.url,
      documents = _route$params.documents;
    var _useState = (0, _react.useState)(url),
      _useState2 = (0, _slicedToArray2.default)(_useState, 2),
      link = _useState2[0],
      setLink = _useState2[1];
    (0, _react.useEffect)(function () {
      var fetchLink = /*#__PURE__*/function () {
        var _ref2 = (0, _asyncToGenerator2.default)(function* () {
          try {
            setLink(yield (0, _api.getLink)(url));
          } catch (error) {
            setLink('Error al cargar la URL');
          }
        });
        return function fetchLink() {
          return _ref2.apply(this, arguments);
        };
      }();
      fetchLink();
      var unsubscribe = navigation.addListener('focus', function () {
        fetchLink();
      });
      return unsubscribe;
    }, []);
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: [styles.container, _theme.stylesTemplate.screenBgColor],
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.TouchableOpacity, {
        style: [styles.containerWithColor, _theme.stylesTemplate.primaryColor, styles.bottomRadius],
        onPress: function onPress() {
          if (!link) return;
          _reactNative.Linking.openURL(link);
        },
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
          resizeMode: "contain",
          source: _$$_REQUIRE(_dependencyMap[9]),
          style: {
            width: 16,
            tintColor: 'white'
          }
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: [styles.textNormal, {
            color: 'white'
          }],
          children: link
        })]
      }), roleLevel == _globalVariables.RoleLevels.ONE && /*#__PURE__*/(0, _jsxRuntime.jsx)(BodyLevelOfClearanceA, {
        expirationDate: expirationDate,
        serial: serial,
        state: state,
        typeServiceText: typeServiceText,
        documents: documents
      }), roleLevel == _globalVariables.RoleLevels.TWO && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(BodyLevelOfClearanceA, {
          expirationDate: expirationDate,
          serial: serial,
          state: state,
          typeServiceText: typeServiceText,
          documents: documents
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(BodyLevelOfClearanceB, {
          manufacturedYear: manufacturedYear,
          provider: provider,
          providerNumber: providerNumber,
          batch: batch
        })]
      }), roleLevel == _globalVariables.RoleLevels.THREE && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(BodyLevelOfClearanceA, {
          expirationDate: expirationDate,
          serial: serial,
          state: state,
          typeServiceText: typeServiceText,
          documents: documents
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(BodyLevelOfClearanceB, {
          manufacturedYear: manufacturedYear,
          provider: provider,
          providerNumber: providerNumber,
          batch: batch
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
          style: styles.containerButton,
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
            onPress: function onPress() {
              navigation.navigate('InfractionsScreen');
            },
            style: [styles.button, _theme.stylesTemplate.primaryColor],
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.buttonText,
              children: "Infracciones"
            })
          })
        })]
      })]
    });
  };
  var BodyLevelOfClearanceA = function BodyLevelOfClearanceA(_ref3) {
    var expirationDate = _ref3.expirationDate,
      typeServiceText = _ref3.typeServiceText,
      serial = _ref3.serial,
      state = _ref3.state,
      documents = _ref3.documents;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: styles.body,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: [styles.containerWithColor, _theme.stylesTemplate.primaryColor],
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
          resizeMode: "contain",
          source: _$$_REQUIRE(_dependencyMap[10]),
          style: {
            width: 16,
            tintColor: 'white'
          }
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: styles.textHeader,
          children: "Perfil privado 2"
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: styles.content,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: {
            gap: 4
          },
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.textNormal,
            children: "Vigencia:"
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.textNormal,
            children: "Servicio:"
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.textNormal,
            children: "Serie:"
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.textNormal,
            children: "Regi\xF3n:"
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.textNormal,
            children: "Documentos:"
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: {
            gap: 4
          },
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: {
              textAlign: 'right'
            },
            children: expirationDate
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: {
              textAlign: 'right'
            },
            children: typeServiceText
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: {
              textAlign: 'right'
            },
            children: serial
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: {
              textAlign: 'right'
            },
            children: state
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: {
              textAlign: 'right'
            },
            children: documents.join(', ')
          })]
        })]
      })]
    });
  };
  var BodyLevelOfClearanceB = function BodyLevelOfClearanceB(_ref4) {
    var provider = _ref4.provider,
      providerNumber = _ref4.providerNumber,
      batch = _ref4.batch,
      manufacturedYear = _ref4.manufacturedYear;
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: styles.body,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: [styles.containerWithColor, _theme.stylesTemplate.primaryColor],
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
          resizeMode: "contain",
          source: _$$_REQUIRE(_dependencyMap[10]),
          style: {
            width: 16,
            tintColor: 'white'
          }
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: styles.textHeader,
          children: "Perfil privado 3"
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: styles.content,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: {
            gap: 4
          },
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.textNormal,
            children: "Nombre del proveedor:"
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.textNormal,
            children: "N\xFAmero del proveedor:"
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.textNormal,
            children: "Lote:"
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.textNormal,
            children: "Fecha de manufactura:"
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: {
            gap: 4
          },
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: {
              textAlign: 'right'
            },
            children: provider
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: {
              textAlign: 'right'
            },
            children: providerNumber
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: {
              textAlign: 'right'
            },
            children: batch
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: {
              textAlign: 'right'
            },
            children: manufacturedYear
          })]
        })]
      })]
    });
  };
  var styles = _reactNative.StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      gap: 16,
      paddingVertical: 12
    },
    containerWithColor: {
      flexDirection: 'row',
      gap: 10,
      width: '100%',
      paddingHorizontal: 32,
      paddingVertical: 12,
      alignItems: 'center',
      borderTopLeftRadius: 5,
      borderTopRightRadius: 5
    },
    body: {
      width: '100%',
      backgroundColor: 'white',
      borderTopLeftRadius: 5,
      borderTopRightRadius: 5,
      borderBottomLeftRadius: 5,
      borderBottomRightRadius: 5,
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25) ' //TODO:
    },
    content: {
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 24,
      gap: 4,
      justifyContent: 'space-between'
    },
    text: {
      fontSize: 20,
      color: 'black'
    },
    textNormal: {
      fontSize: 14,
      color: 'black'
    },
    textHeader: {
      verticalAlign: 'middle',
      fontSize: 14,
      color: 'white',
      fontWeight: 'bold'
    },
    bottomRadius: {
      borderBottomLeftRadius: 5,
      borderBottomRightRadius: 5
    },
    containerButton: {
      width: '100%',
      paddingHorizontal: 42
    },
    button: {
      paddingVertical: 12,
      backgroundColor: '#4A4546',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 5,
      width: '100%'
    },
    buttonText: {
      textAlign: 'center',
      fontSize: 15,
      color: '#fff'
    }
  });
