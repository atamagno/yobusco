// UserJobs controller
angular.module('jobs').controller('ListJobsController',
    function($scope, $rootScope, $state, $stateParams, JobDetails) {

        $scope.itemsPerPage = 6;
        $scope.maxPages = 5;
        $scope.showUser = $scope.authentication.user.roles.indexOf('servicesupplier') != -1;
        $scope.showServiceSupplier = $scope.authentication.user.roles.indexOf('user') != -1;

        $scope.getAllJobs = function() {

            $scope.showList = false;
            $scope.jobstatus = $stateParams.status;
            $scope.currentPage = $stateParams.currentPage;

            $scope.jobListTitle = 'Todos los trabajos';
            $scope.jobStatusLabel = '.';
            switch ($scope.jobstatus) {
                case 'active':
                    $scope.jobListTitle = 'Trabajos activos';
                    $scope.jobStatusLabel = ' activo.';
                    break;
                case 'finished':
                    $scope.jobListTitle = 'Trabajos terminados';
                    $scope.jobStatusLabel = ' finalizado.';
                    break;
                case 'incomplete':
                    $scope.jobListTitle = 'Trabajos incompletos';
                    $scope.jobStatusLabel = ' incompleto.';
                    break;
                case 'pending-self':
                    $scope.jobListTitle = 'Trabajos a la espera de mi aprobacion';
                    $scope.jobStatusLabel = ' que requiere tu aprobacion.';
                    break;
                case 'pending-other':
                    if($scope.isServiceSupplier){
                        $scope.jobListTitle = 'Trabajos a aprobar por clientes';
                        $scope.jobStatusLabel = ' que requiere aprobacion de tus clientes.';
                    }
                    else{
                        $scope.jobListTitle = 'Trabajos a aprobar por prestadores de servicios';
                        $scope.jobStatusLabel = ' que requiere aprobacion de prestadores de servicios.';
                    }
                    break;
                case 'challenged':
                    $scope.jobListTitle = 'Trabajos pendientes de resolucion';
                    $scope.jobStatusLabel = ' pendiente de resolucion.';
                    break;
                case 'nothired':
                    $scope.jobListTitle = 'Trabajos no contratados';
                    $scope.jobStatusLabel = ' no contratado.';
                    break;
            }

            // TODO: maybe hit the server only when querying for all jobs...
            // and then apply filters on the client side for the others??
            // This may save hits to the server...(it won't show live results for all statuses, though...)
            JobDetails.jobs.query({
                currentPage: $stateParams.currentPage,
                itemsPerPage: $scope.itemsPerPage,
                status: $scope.jobstatus
            }).$promise.then(function (response) {
                    $scope.currentPage = $stateParams.currentPage;
                    $scope.jobs = response.jobs;
                    $scope.totalItems = response.totalItems;
                    $scope.showList = $scope.totalItems > 0;
            });

        };

        $scope.navigateToResults = function() {
            $state.go('jobs.list', {
                status: $scope.jobstatus,
                currentPage: $scope.currentPage,
                itemsPerPage: $scope.itemsPerPage
            });
        };

});




