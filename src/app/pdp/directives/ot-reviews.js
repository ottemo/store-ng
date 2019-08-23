angular.module('pdpModule')

.directive('otReviews', ['pdpApiService', 'visitorLoginService', 'commonUtilService', function(pdpApiService, visitorLoginService, commonUtilService) {
        return {
            restrict: 'E',
            scope: {
                productId: "=",
                productName: "="
            },
            templateUrl: '/views/pdp/directives/ot-reviews.html',
            link: function($scope, element, attrs) {

                pdpApiService.reviewList({"product_id": $scope.productId}).$promise.then(function (response) {
                    $scope.reviewsList = response.result || [];
                    $scope.showFirstReviewMessage = ($scope.reviewsList.length  == 0);
                });

                visitorLoginService.isLoggedIn()
                    .then(function(isLoggedIn) {
                        $scope.isLoggedIn = isLoggedIn;
                    });

                $scope.visitor = visitorLoginService.getVisitor();

                $scope.hasErr = function(field) {
                    return $scope.addReviewForm[field].$invalid && ($scope.addReviewForm.$submitted || $scope.addReviewForm[field].$touched);
                };

                $scope.saveReview = function () {
                    pdpApiService.addReview(
                        {
                            "productId": $scope.productId,
                            "stars": $scope.review.rating,
                            "review": $scope.review.review
                        }).$promise.then(
                        function (response) {
                            if (response.error === null) {
                                $scope.saveMessage = { message: "Your review was sent successfully" };
                            } else {
                                $scope.saveMessage = commonUtilService.getMessage(response);
                            }

                            $scope.review = {};
                            $scope.addReviewForm.$setPristine();
                            $scope.addReviewForm.$setUntouched();
                        }
                    );
                };
            }
        };
    }
]);
