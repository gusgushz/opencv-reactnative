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
  var _api = _$$_REQUIRE(_dependencyMap[6]);
  var _ScanContext = _$$_REQUIRE(_dependencyMap[7]);
  var _native = _$$_REQUIRE(_dependencyMap[8]);
  var _jsxRuntime = _$$_REQUIRE(_dependencyMap[9]);
  function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
  function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
  var InformationScreen = exports.InformationScreen = function InformationScreen(_ref) {
    var route = _ref.route,
      navigation = _ref.navigation;
    var _route$params = route.params,
      roleLevel = _route$params.roleLevel,
      info = _route$params.info;
    var _useScanContext = (0, _ScanContext.useScanContext)(),
      parts = _useScanContext.parts,
      setParts = _useScanContext.setParts,
      partsEdomex = _useScanContext.partsEdomex,
      setPartsEdomex = _useScanContext.setPartsEdomex;
    var _useState = (0, _react.useState)([false, false, false]),
      _useState2 = (0, _slicedToArray2.default)(_useState, 2),
      visibilityLevels = _useState2[0],
      setVisibilityLevels = _useState2[1];
    var _useState3 = (0, _react.useState)('Cargando url...'),
      _useState4 = (0, _slicedToArray2.default)(_useState3, 2),
      link = _useState4[0],
      setLink = _useState4[1];
    var fetchLink = /*#__PURE__*/function () {
      var _ref2 = (0, _asyncToGenerator2.default)(function* (url) {
        try {
          setLink(yield (0, _api.getLink)(url));
        } catch (error) {
          setLink('Error al cargar la URL');
        }
      });
      return function fetchLink(_x) {
        return _ref2.apply(this, arguments);
      };
    }();
    (0, _react.useEffect)(function () {
      if (parts) {
        fetchLink(parts.url);
      } else if (partsEdomex) {
        setLink(partsEdomex.url);
      } else if (info) {
        setLink('https://edomex.gob.mx');
      }
    }, []);
    (0, _native.useFocusEffect)((0, _react.useCallback)(function () {
      // Do something when the screen is focused
      return function () {
        // Do something when the screen is unfocused. Useful for cleanup functions
        setParts(null);
        setPartsEdomex(null);
        setLink('Cargando url...');
        setVisibilityLevels([false, false, false]);
      };
    }, []));
    (0, _react.useEffect)(function () {
      var handleVisibilityLevels = function handleVisibilityLevels(roleLevel) {
        if (roleLevel == '2') return setVisibilityLevels([true, false, false]);
        if (roleLevel == '3') return setVisibilityLevels([true, true, false]);
        if (roleLevel == '4') return setVisibilityLevels([true, true, true]);
      };
      handleVisibilityLevels(roleLevel);
      console.log('roleLevel:', roleLevel);
    }, [roleLevel]);
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
          source: _$$_REQUIRE(_dependencyMap[10]),
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
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
        children: [visibilityLevels[0] && /*#__PURE__*/(0, _jsxRuntime.jsx)(BodyLevelOfClearanceA, {
          parts: parts,
          partsEdomex: partsEdomex,
          info: info
        }), visibilityLevels[1] && /*#__PURE__*/(0, _jsxRuntime.jsx)(BodyLevelOfClearanceB, {
          parts: parts,
          partsEdomex: partsEdomex,
          info: info
        }), visibilityLevels[2] && /*#__PURE__*/(0, _jsxRuntime.jsx)(BodyLevelOfClearanceC, {
          parts: parts,
          partsEdomex: partsEdomex,
          navigation: navigation,
          info: info
        })]
      })]
    });
  };
  var BodyLevelOfClearanceA = function BodyLevelOfClearanceA(_ref3) {
    var parts = _ref3.parts,
      partsEdomex = _ref3.partsEdomex,
      info = _ref3.info;
    if (parts) {
      return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: styles.body,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: [styles.containerWithColor, _theme.stylesTemplate.primaryColor],
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
            resizeMode: "contain",
            source: _$$_REQUIRE(_dependencyMap[11]),
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
              children: parts.expirationDate
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: parts.typeServiceText
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: parts.serial
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: parts.state
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: parts.documents.join(', ')
            })]
          })]
        })]
      });
    } else if (partsEdomex) {
      return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: styles.body,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: [styles.containerWithColor, _theme.stylesTemplate.primaryColor],
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
            resizeMode: "contain",
            source: _$$_REQUIRE(_dependencyMap[11]),
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
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
            style: {
              gap: 4
            },
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.textNormal,
              children: "Folio"
            })
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
            style: {
              gap: 4
            },
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: partsEdomex.folio
            })
          })]
        })]
      });
    } else if (info) {
      return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: styles.body,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: [styles.containerWithColor, _theme.stylesTemplate.primaryColor],
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
            resizeMode: "contain",
            source: _$$_REQUIRE(_dependencyMap[11]),
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
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
            style: {
              gap: 4
            },
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.textNormal,
              children: "Folio"
            })
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
            style: {
              gap: 4
            },
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: "A20425223"
            })
          })]
        })]
      });
    }
  };
  var BodyLevelOfClearanceB = function BodyLevelOfClearanceB(_ref4) {
    var parts = _ref4.parts,
      partsEdomex = _ref4.partsEdomex,
      info = _ref4.info;
    if (parts) {
      return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: styles.body,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: [styles.containerWithColor, _theme.stylesTemplate.primaryColor],
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
            resizeMode: "contain",
            source: _$$_REQUIRE(_dependencyMap[11]),
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
              children: parts.provider
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: parts.providerNumber
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: parts.batch
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: parts.manufacturedYear
            })]
          })]
        })]
      });
    } else if (partsEdomex) {
      return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: styles.body,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: [styles.containerWithColor, _theme.stylesTemplate.primaryColor],
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
            resizeMode: "contain",
            source: _$$_REQUIRE(_dependencyMap[11]),
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
              children: "Nombre del proveedor"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.textNormal,
              children: "N\xFAmero del proveedor"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.textNormal,
              children: "No. lote"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.textNormal,
              children: "Fecha de manufactura"
            })]
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
            style: {
              gap: 4
            },
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: partsEdomex.providerName
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: partsEdomex.providerId != '26' ? '26' : '26'
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: partsEdomex.batchNumber
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: ["20", partsEdomex.manufacturedYear]
            })]
          })]
        })]
      });
    } else if (info) {
      return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: styles.body,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: [styles.containerWithColor, _theme.stylesTemplate.primaryColor],
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
            resizeMode: "contain",
            source: _$$_REQUIRE(_dependencyMap[11]),
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
              children: "Nombre del proveedor"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.textNormal,
              children: "N\xFAmero del proveedor"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.textNormal,
              children: "No. lote"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.textNormal,
              children: "Fecha de manufactura"
            })]
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
            style: {
              gap: 4
            },
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: "Vifinsa"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: "26"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: "010"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: "2025"
            })]
          })]
        })]
      });
    }
  };
  var BodyLevelOfClearanceC = function BodyLevelOfClearanceC(_ref5) {
    var parts = _ref5.parts,
      partsEdomex = _ref5.partsEdomex,
      navigation = _ref5.navigation,
      info = _ref5.info;
    if (parts) {
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        style: styles.containerButton,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
          onPress: function onPress() {
            if (navigation) {
              navigation.navigate('InfractionsScreen');
            }
          },
          style: [styles.button, _theme.stylesTemplate.primaryColor],
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.buttonText,
            children: "Infracciones"
          })
        })
      });
    } else if (partsEdomex) {
      return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: styles.body,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: [styles.containerWithColor, _theme.stylesTemplate.primaryColor],
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
            resizeMode: "contain",
            source: _$$_REQUIRE(_dependencyMap[11]),
            style: {
              width: 16,
              tintColor: 'white'
            }
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.textHeader,
            children: "Perfil privado 4"
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: styles.content,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
            style: {
              gap: 4
            },
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.textNormal,
              children: "Holograma"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.textNormal,
              children: "Semestre del certificado"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.textNormal,
              children: "A\xF1o de vigencia"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.textNormal,
              children: "Placa"
            })]
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
            style: {
              gap: 4
            },
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: partsEdomex.holo
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: partsEdomex.semester
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: partsEdomex.expirationDate
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: partsEdomex.serial
            })]
          })]
        })]
      });
    } else if (info) {
      return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: styles.body,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: [styles.containerWithColor, _theme.stylesTemplate.primaryColor],
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Image, {
            resizeMode: "contain",
            source: _$$_REQUIRE(_dependencyMap[11]),
            style: {
              width: 16,
              tintColor: 'white'
            }
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.textHeader,
            children: "Perfil privado 4"
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: styles.content,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
            style: {
              gap: 4
            },
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.textNormal,
              children: "Holograma"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.textNormal,
              children: "Semestre del certificado"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.textNormal,
              children: "A\xF1o de vigencia"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.textNormal,
              children: "Placa"
            })]
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
            style: {
              gap: 4
            },
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: "00"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: "2"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: "2025"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: {
                textAlign: 'right'
              },
              children: "AAA-000-A"
            })]
          })]
        })]
      });
    }
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
