'use strict';

//ServiceCategories service used to communicate ServiceCategories REST endpoints
angular.module('core')
    .factory('Alerts',function($timeout) {
        return {
            visible: false,
            type: '',
            msg: '',

            show: function(type, msg) {
                this.visible = true;
                this.type = type;
                this.msg = msg;

                var self = this;
                $timeout(function(){
                    self.visible = false;
                }, 3000);
            },

            close: function() {
                this.visible = false;
            }
        };
    });