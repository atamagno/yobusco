'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Por favor ingresa una contraseña con al menos 10 caracteres, al menos un ' +
                         'número, una letra minúscula, una letra mayúscula y un caracter especial.';

        return popoverMsg;
      }
    };
  }
]);
