  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.useScanContext = exports.ScanContextProvider = undefined;
  var _slicedToArray2 = _interopRequireDefault(_$$_REQUIRE(_dependencyMap[1]));
  var _react = _interopRequireWildcard(_$$_REQUIRE(_dependencyMap[2]));
  var _jsxRuntime = _$$_REQUIRE(_dependencyMap[3]);
  function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
  function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
  /*
  FIXME: Este archivo se usa para guardar el usuario mientras se está dentro de la aplicación
  Primero se había planteado así, pero se cambió a usar MMKV para guardar el usuario y la sesión
  de forma persistente. 
  Para volverlo a usar se tendría que descomentar el export y los imports en los archivos que lo usan.
  Estos archivos son: 
  - App.tsx
  - LoginScreen.tsx
  - ProfileScreen.tsx
  - HomeScreen.tsx
  */

  var ScanContext = (0, _react.createContext)(undefined);
  var ScanContextProvider = exports.ScanContextProvider = function ScanContextProvider(_ref) {
    var children = _ref.children;
    var _useState = (0, _react.useState)(null),
      _useState2 = (0, _slicedToArray2.default)(_useState, 2),
      parts = _useState2[0],
      setParts = _useState2[1];
    var _useState3 = (0, _react.useState)(null),
      _useState4 = (0, _slicedToArray2.default)(_useState3, 2),
      partsEdomex = _useState4[0],
      setPartsEdomex = _useState4[1];
    var contextValue = (0, _react.useMemo)(function () {
      return {
        parts: parts,
        setParts: setParts,
        partsEdomex: partsEdomex,
        setPartsEdomex: setPartsEdomex
      };
    }, [parts, partsEdomex]);
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(ScanContext.Provider, {
      value: contextValue,
      children: children
    });
  };
  var useScanContext = exports.useScanContext = function useScanContext() {
    var context = (0, _react.useContext)(ScanContext);
    if (!context) {
      throw new Error('useScanContext must be used within a ScanContextProvider');
    }
    return context;
  };
