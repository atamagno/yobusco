// UserJobs controller
angular.module('jobs').controller('ListJobsController',
    function($scope, $rootScope, $state, $stateParams, JobDetails) {

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
                    $scope.jobStatusLabel = ' terminado.';
                    break;
                case 'pending':
                    $scope.jobListTitle = 'Trabajos pendientes de aprobacion';
                    $scope.jobStatusLabel = ' pendiente de aprobacion.';
                    break;
            }

            if (!$scope.jobs) {
                JobDetails.jobs.query({
                    currentPage: $stateParams.currentPage,
                    itemsPerPage: $scope.itemsPerPage,
                    jobUserId: $scope.authentication.user._id,
                    isServiceSupplier: $scope.isServiceSupplier,
                    status: 'all'
                }).$promise.then(function (response) {
                        $scope.currentPage = $stateParams.currentPage;
                        $scope.jobs = response.jobs;
                        $scope.filterJobs = $scope.jobs;
                        $scope.totalItems = response.totalItems;
                        if ($scope.jobstatus != 'all') {
                            $scope.filterJobs = $scope.jobs.filter(filterByStatus);
                            $scope.totalItems = $scope.filterJobs.length;
                        }

                        $scope.showList = $scope.totalItems > 0;
                        var reportedJobList = $scope.jobs.filter(filterReported);
                        var reportedJobs = reportedJobList.length > 0;

                        $rootScope.$broadcast('updateReported', reportedJobs);
                    });
            } else {

                if ($scope.jobstatus != 'all') {
                    $scope.filterJobs = $scope.jobs.filter(filterByStatus);
                    $scope.totalItems = $scope.filterJobs.length;
                }

                $scope.showList = $scope.totalItems > 0;
                var reportedJobList = $scope.jobs.filter(filterReported);
                var reportedJobs = reportedJobList.length > 0;

                $rootScope.$broadcast('updateReported', reportedJobs);
            }
        };

        $scope.navigateToResults = function() {
            $state.go('jobs.list', {
                status: $scope.jobstatus,
                currentPage: $scope.currentPage,
                itemsPerPage: $scope.itemsPerPage
            });
        };

        function filterByStatus(job) {
            switch ($scope.jobstatus) {
                case 'active':
                case 'pending':
                    return ((job.status.keyword == $scope.jobstatus) && !job.reported);
                case 'finished':
                    return (job.status.finished && !job.reported);
                case 'reported':
                    return job.reported;
            }
        }

        function filterReported(job) {
            return job.reported;
        }


    });




