
angular.module('categoryModule')

.directive('otBestSellers', ['categoryService',
    function(categoryService) {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: '/views/category/directives/ot-best-sellers.html',
            link: function($scope) {
                categoryService.getBestSellers().then(function(response){
                    $scope.bestSellers = response;
                });
            }
        };
    }
]);