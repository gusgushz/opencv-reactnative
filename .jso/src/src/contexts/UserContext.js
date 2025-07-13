  var _interopRequireDefault = _$$_REQUIRE(_dependencyMap[0]);
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

  var UserContext = (0, _react.createContext)(undefined);

  //export { UserProvider, useUserContext };
