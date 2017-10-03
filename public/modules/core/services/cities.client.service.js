'use strict';

angular.module('core')
	.factory('Cities',
		function($resource) {
			return $resource('cities', {},
				{
					query: { method: 'GET', cache: true, isArray: true }
				});
		})
    .factory('CitiesHelper',
        function(){
            return {
                findById: function(cities, cityId){

                    if(cityId){
                        for (var i = 0; i < cities.length; i++) {
                            if(cityId == cities[i]._id)
                                return cities[i];
                        }
                    }

                }

            };
        });