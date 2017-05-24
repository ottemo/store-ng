angular.module("visitorModule")

.controller("visitorAccountController", [
    "$scope",
    "$location",
    "visitorLoginService",
    "visitorApiService",
    "commonUtilService",
    function($scope, $location, visitorLoginService, visitorApiService, commonUtilService) {

        // Change Password Form
        $scope.changePswCredentials = {};

        // Sidebar
        $scope.activePath = $location.path();

        ////////////////////////////////

        $scope.activate = function () {
            // Data
            $scope.visitor = visitorLoginService.getVisitor();

            // Breadcrumbs
            $scope.$emit("add-breadcrumbs", {
                "label": "MyAccount",
                "url": "/account"
            });

            // Redirect
            visitorLoginService.isLoggedIn()
                .then(function(isLoggedIn) {
                    if (!isLoggedIn) {
                        $location.path("/");
                    }
                });
        };

        // REFACTOR: We shouldn't be using the visitor object for both
        // display and as form information, it causes a bug if you edit
        // and don't save because of two way data binding
        // REFACTOR: When we make the above change we'll have the same
        // dot `.` problem as below
        $scope.save = function() {
            delete $scope.visitor["password"];
            delete $scope.visitor["billing_address"];
            delete $scope.visitor["shipping_address"];
            delete $scope.visitor["token"];

            visitorApiService.update($scope.visitor).$promise
                .then(function(response) {
                    if (response.error === null) {
                        setTimeout($scope.closePopUp, 2000);
                        $scope.message = commonUtilService.getMessage(null, "success", "Сhanges have been made");
                    } else {
                        $scope.message = commonUtilService.getMessage(null, "danger", "Something went wrong");
                    }
                });
        };

        // REFACTOR: We shouldn't have to pass the form back. We are currently
        // doing this because ng-include is creating a scope and our variables
        // aren't encapsulated in objects so that they pass by reference (dottted `.`)
        $scope.changePassword = function(passwordForm) {
            $scope.messagePassword = '';
            var data = {
                "old_password": $scope.changePswCredentials.oldpassword,
                "password": $scope.changePswCredentials.password
            };

            visitorApiService.update(data).$promise
                .then(function(response) {
                    if (response.error === null) {
                        setTimeout($scope.closePopUp, 2000);
                        $scope.messagePassword = commonUtilService.getMessage(response, "success", "Password change was successfully");

                        // Clean the form
                        $scope.changePswCredentials = {};
                        passwordForm.$setPristine();
                        passwordForm.$setUntouched();
                    } else {
                        $scope.messagePassword = commonUtilService.getMessage(response);
                    }
                });
        };

        // helper for closing popups
        $scope.closePopUp = function () {
            $(".modal").modal("hide");
        };

        // REFACTOR
        // Sidebar
        $scope.isActive = function(path) {
            return $scope.activePath === path;
        };
    }
]);

