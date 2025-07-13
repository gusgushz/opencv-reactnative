  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.sufix = exports.stateNameToId = exports.RoleLevels = undefined;
  var RoleLevels = exports.RoleLevels = /*#__PURE__*/function (RoleLevels) {
    RoleLevels["ZERO"] = "1";
    RoleLevels["ONE"] = "2";
    RoleLevels["TWO"] = "3";
    RoleLevels["THREE"] = "4";
    return RoleLevels;
  }({});
  var sufix = exports.sufix = 'ddt131';
  var regions = ['AGUASCALIENTES', 'BAJA CALIFORNIA', 'BAJA CALIFORNIA SUR', 'CAMPECHE', 'CHIAPAS', 'CHIHUAHUA', 'CIUDAD DE MEXICO', 'COAHUILA', 'COLIMA', 'DURANGO', 'GUANAJUATO', 'GUERRERO', 'HIDALGO', 'JALISCO', 'MEXICO', 'MICHOACAN', 'MORELOS', 'NAYARIT', 'NUEVO LEON', 'OAXACA', 'PUEBLA', 'QUERETARO', 'QUINTANA ROO', 'SAN LUIS POTOSI', 'SINALOA', 'SONORA', 'TABASCO', 'TAMAULIPAS', 'TLAXCALA', 'VERACRUZ', 'YUCATAN', 'ZACATECAS', 'BELIZE', 'CAYO', 'COROZAL', 'ORANGE WALK', 'STANN CREEK', 'TOLEDO'];
  var stateNameToId = exports.stateNameToId = function stateNameToId(state) {
    var _regions$findIndex;
    var region = (_regions$findIndex = regions.findIndex(function (region) {
      return region === state;
    })) != null ? _regions$findIndex : -1;
    console.log('region(stateId)', region);
    return region;
  };
