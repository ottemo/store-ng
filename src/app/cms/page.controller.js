angular.module("cmsModule")

.controller("cmsPageController", [
    "$scope",
    "$routeParams",
    "$location",
    "cmsApiService",
    "cmsPageService",
    "$sce",
    function($scope, $routeParams, $location, cmsApiService, cmsPageService, $sce) {

        $scope.pageId = $routeParams.id;
        $scope.page = {};

        /////////////////////////
        $scope.activate = function () {
            // Get the page
            $scope._getPage().then(function(page){
                $scope.page = page;
                $scope.page.content = $sce.trustAsHtml(page.content);

                if (page.identifier) {
                    // BREADCRUMBS
                    $scope.$emit("add-breadcrumbs", {
                        "label": $scope.page.identifier,
                        "url": cmsPageService.getUrl($scope.page._id)
                    });
                }
            });
        };

        $scope._getPage = function() {
            return cmsApiService.getPage({"pageID": $scope.pageId}).$promise
                .then(function(response){
                    if (response.error !== null) {
                        $location.path("/");
                    }

                    return response.result || {};
                });
        };
    }
]);

