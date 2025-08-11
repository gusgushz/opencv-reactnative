  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.storeUsersData = exports.storeUserSession = exports.storeUser = exports.storeToken = exports.storeServices = exports.storeLastValidateTokenDate = exports.storeKey = exports.storeIsFirstLogin = exports.storeDaysDifference = exports.removeUsersData = exports.removeUserSession = exports.removeUser = exports.removeToken = exports.removeServices = exports.removeLastValidateTokenDate = exports.removeKey = exports.removeAll = exports.getUsersData = exports.getUserSession = exports.getUser = exports.getToken = exports.getServices = exports.getLastValidateTokenDate = exports.getKey = exports.getIsFirstLogin = exports.getDaysDifference = undefined;
  var _reactNativeMmkv = _$$_REQUIRE(_dependencyMap[0]);
  var storage = new _reactNativeMmkv.MMKV();
  var storeUserSession = exports.storeUserSession = function storeUserSession(userSession) {
    console.log('Storing userSession:', userSession);
    storage.set('userSession', JSON.stringify(userSession));
  };
  var getUserSession = exports.getUserSession = function getUserSession() {
    var userSession = storage.getString('userSession');
    if (userSession === undefined) {
      return null;
    } else {
      console.log('Getting userSession:', JSON.parse(userSession));
      return JSON.parse(userSession);
    }
  };
  var removeUserSession = exports.removeUserSession = function removeUserSession() {
    console.log('Removing userSession');
    storage.delete('userSession');
  };
  var storeUser = exports.storeUser = function storeUser(user) {
    console.log('Storing user:', user);
    storage.set('user', JSON.stringify(user));
  };
  var getUser = exports.getUser = function getUser() {
    var user = storage.getString('user');
    if (user === undefined) {
      return null;
    } else {
      console.log('Getting user:', JSON.parse(user));
      return JSON.parse(user);
    }
  };
  var removeUser = exports.removeUser = function removeUser() {
    console.log('Removing user');
    storage.delete('user');
  };
  var storeServices = exports.storeServices = function storeServices(services) {
    console.log('Storing services');
    storage.set('services', JSON.stringify(services));
  };
  var getServices = exports.getServices = function getServices() {
    var services = storage.getString('services');
    if (services === undefined) {
      return null;
    } else {
      console.log('Getting services');
      return JSON.parse(services);
    }
  };
  var removeServices = exports.removeServices = function removeServices() {
    console.log('Removing services');
    storage.delete('services');
  };
  var storeIsFirstLogin = exports.storeIsFirstLogin = function storeIsFirstLogin(isFirstLogin) {
    console.log('Storing isFirstLogin:', isFirstLogin);
    storage.set('isFirstLogin', JSON.stringify('false'));
  };
  var getIsFirstLogin = exports.getIsFirstLogin = function getIsFirstLogin() {
    var isFirstLogin = storage.getString('isFirstLogin');
    if (isFirstLogin === undefined) {
      return null;
    } else {
      console.log('Getting isFirstLogin:', JSON.parse(isFirstLogin));
      return JSON.parse(isFirstLogin);
    }
  };

  // export const removeIsFirstLogin = () => {
  //   console.log('Removing isFirstLogin');
  //   storage.delete('isFirstLogin');
  // };

  var storeUsersData = exports.storeUsersData = function storeUsersData(usersData) {
    console.log('Storing usersData');
    storage.set('usersData', JSON.stringify(usersData));
  };
  var getUsersData = exports.getUsersData = function getUsersData() {
    var usersData = storage.getString('usersData');
    if (usersData === undefined) {
      return null;
    } else {
      console.log('Getting usersData');
      return JSON.parse(usersData);
    }
  };
  var removeUsersData = exports.removeUsersData = function removeUsersData() {
    console.log('Removing usersData');
    storage.delete('usersData');
  };
  var storeToken = exports.storeToken = function storeToken(token) {
    console.log('Storing token:', token);
    storage.set('token', JSON.stringify(token));
  };
  var getToken = exports.getToken = function getToken() {
    var token = storage.getString('token');
    if (token === undefined) {
      return null;
    } else {
      console.log('Getting token:', JSON.parse(token));
      return JSON.parse(token);
    }
  };
  var removeToken = exports.removeToken = function removeToken() {
    console.log('Removing token');
    storage.delete('token');
  };
  var storeKey = exports.storeKey = function storeKey(key) {
    console.log('Storing key:', key);
    storage.set('key', JSON.stringify(key));
  };
  var getKey = exports.getKey = function getKey() {
    var key = storage.getString('key');
    if (key === undefined) {
      return null;
    } else {
      console.log('Getting key:', JSON.parse(key));
      return JSON.parse(key);
    }
  };
  var removeKey = exports.removeKey = function removeKey() {
    console.log('Removing key');
    storage.delete('key');
  };
  var storeLastValidateTokenDate = exports.storeLastValidateTokenDate = function storeLastValidateTokenDate(date) {
    console.log('Storing date:', date);
    storage.set('date', JSON.stringify(date));
  };
  var getLastValidateTokenDate = exports.getLastValidateTokenDate = function getLastValidateTokenDate() {
    var date = storage.getString('date');
    if (date === undefined) {
      return null;
    } else {
      console.log('Getting date:', JSON.parse(date));
      return JSON.parse(date);
    }
  };
  var removeLastValidateTokenDate = exports.removeLastValidateTokenDate = function removeLastValidateTokenDate() {
    console.log('Removing date');
    storage.delete('date');
  };
  var storeDaysDifference = exports.storeDaysDifference = function storeDaysDifference(diff) {
    console.log('Storing days diff:', diff);
    storage.set('diff', JSON.stringify(diff));
  };
  var getDaysDifference = exports.getDaysDifference = function getDaysDifference() {
    var diff = storage.getString('diff');
    if (diff === undefined) {
      return null;
    } else {
      console.log('Getting date:', JSON.parse(diff));
      return JSON.parse(diff);
    }
  };
  var removeAll = exports.removeAll = function removeAll() {
    storage.clearAll();
  };
