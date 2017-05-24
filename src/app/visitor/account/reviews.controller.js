angular.module("visitorModule")

.controller('visitorAccountReviewsController', [
    '$scope',
    '$location',
    'visitorLoginService',
    'visitorApiService',
    'pdpApiService',
    'pdpProductService',
    'commonUtilService',
    function(
        $scope,
        $location,
        visitorLoginService,
        visitorApiService,
        pdpApiService,
        pdpProductService,
        commonUtilService
    ) {

        $scope.reviewList= [];
        $scope.review = {};
        $scope.visitor = visitorLoginService.getVisitor();

        //////////////////////////

        $scope.activate = function() {
            // BREADCRUMBS
            $scope.$emit('add-breadcrumbs', {
                'label': 'MyAccount',
                'url': '/account'
            });
            $scope.$emit('add-breadcrumbs', {
                'label': 'Reviews',
                'url': '/account/reviews'
            });

            visitorLoginService.isLoggedIn().then(function(isLoggedIn) {
                if (!isLoggedIn) {
                    $location.path("/");
                } else {
                    $scope.loadReviewList();
                }
            });
        };

        $scope.loadReviewList = function () {
            visitorApiService.reviewList().$promise.then(function (response) {
                if (response.error === null) {
                    var reviewList = response.result || [];
                    var productsIdList = _.map(reviewList, 'product_id').join(',');

                    pdpApiService.getProducts({
                        _id: productsIdList,
                        extra: 'name'}
                    ).$promise.then(
                        function (response) {
                            if (response.error === null) {
                                var productList = response.result || [];

                                _.forEach(reviewList, function(review) {
                                    var product = _.filter(productList, { ID: review.product_id })[0];
                                    if (product) {
                                        review.productUrl = pdpProductService.getUrl(product.ID);
                                        review.productImg = (product.Images) ? product.Images[0].thumb : '';
                                        review.productName = product.Name;
                                    }
                                });
                            }

                            $scope.reviewList = reviewList;
                    });
                }
            });
        };

        $scope.canShowReviews = function() {
            return _.filter($scope.reviewList, 'productName').length > 0;
        };

        $scope.popUpOpen = function(id) {
            $('#edit-review').modal('show');

            visitorApiService.getReview({
                'reviewID': id
            }).$promise.then(
                function(response) {
                    $scope.review = response.result || [];
                    $('#edit-review').modal('show');
                }
            );
        };

        $scope.remove = function(id) {
            visitorApiService.deleteReview({
                'reviewID': id
            }).$promise.then(
                function(response) {
                    if (response.result === 'ok') {
                        $scope.loadReviewList();
                        $scope.message = commonUtilService.getMessage(null, 'success', 'Review was deleted with success');
                    }
                }
            );
        };

        $scope.save = function() {
            visitorApiService.editReview({
                'reviewID': $scope.review._id,
                'review': $scope.review.review
            }).$promise.then(
                function(response){
                    if (response.error === null) {
                        $scope.loadReviewList();
                        $scope.message = commonUtilService.getMessage(null, 'success', 'Review was changed with success');
                        $('#edit-review').modal('hide');
                    } else {
                        $scope.messageEdit = commonUtilService.getMessage(response);
                    }
                }
            );
        };

        $scope.hasErr = function(field) {
            return $scope.reviewForm[field].$invalid && ($scope.reviewForm.$submitted || $scope.reviewForm[field].$touched);
        };

        $scope.isActive = function(path) {
            return ($location.path() === path);
        };
    }
]);
