angular.module("visitorModule")

.controller('visitorAccountAddressController', [
    '$scope',
    '$location',
    'visitorLoginService',
    'visitorApiService',
    'coreStateService',
    'commonUtilService',
    'coreCountryService',
    function(
        $scope,
        $location,
        visitorLoginService,
        visitorApiService,
        coreStateService,
        commonUtilService,
        coreCountryService
    ) {
        // Address List
        $scope.addresses = [];
        $scope.defaultAddresses = [];

        // Edit / Add Form
        $scope.address = {};
        $scope.addressForm = {};
        $scope.countries = coreCountryService;
        $scope.states = coreStateService;
        $scope.message = '';

        // Sidebar, refactor
        $scope.activePath = $location.path();

        //////////////////////////

        $scope.activate = function() {
            $scope.visitor = visitorLoginService.getVisitor();

            // BREADCRUMBS
            $scope.$emit('add-breadcrumbs', {
                'label': 'myAccount',
                'url': '/account'
            });
            $scope.$emit('add-breadcrumbs', {
                'label': 'Addresses',
                'url': '/account/address'
            });

            // Redirect
            visitorLoginService.isLoggedIn()
                .then(function(isLoggedIn) {
                    if (!isLoggedIn) {
                        $location.path("/");
                    }
                });

            $scope._getAddresses();
        };

        // Fetch addresses
        $scope._getAddresses = function getAddresses() {
            var addresses_params = {
                extra: 'first_name, last_name, phone'
            };

            visitorApiService.getAddresses(addresses_params).$promise
                .then(function(response) {
                    $scope.addresses = response.result || [];
                    $scope.defaultAddresses = [];

                    if ($scope.addresses.length > 0) {
                        _.forEach($scope.addresses, function(address){
                            if (address.ID === $scope.visitor.billing_address_id || address.ID === $scope.visitor.shipping_address_id) {
                                $scope.defaultAddresses.push({
                                    isBilling: address.ID === $scope.visitor.billing_address_id,
                                    isShipping: address.ID === $scope.visitor.shipping_address_id,
                                    address: address
                                });
                            }
                        });
                    }
                });
        }

        // Listing Addresses
        $scope.popUpOpen = function(addressId) {
            $scope._clearForm();

            if (typeof addressId === 'undefined') {
                $('#parent_popup_address').modal('show');
            } else {
                visitorApiService.loadAddress({
                    'addressID': addressId
                }).$promise.then(
                    function(response) {
                        $scope.address = response.result || [];

                        $('#parent_popup_address').modal('show');
                    }
                );
            }
        };

        $scope.remove = function(id) {
            visitorApiService.deleteAddress({
                'addressID': id
            }, function(response) {
                if (response.result === 'ok') {
                    visitorLoginService.isLoggedIn(true).then(function(){
                        $scope._getAddresses();
                    });
                }
            });
        };

        $scope.setAsDefault = function(id, addressType) {
            var params = {};

            if (addressType == 'shipping') {
                params['shipping_address_id'] =  id;
            } else if (addressType == 'billing'){
                params['billing_address_id'] =  id;
            } else {
                return;
            }

            visitorApiService.update(params).$promise.then(
                function() {
                    visitorLoginService.isLoggedIn(true)
                        .then(function(){
                            $scope._getAddresses();
                            $scope.message = commonUtilService.getMessage(null, 'success', 'Address was selected as default with success');
                        });
                }
            );
        };

        $scope._clearForm = function() {
            $scope.message = '';
            $scope.address = {
                'visitor_id': $scope.visitor._id
            };
            $scope.addressForm.$setPristine();
            $scope.addressForm.$setUntouched();
        };

        $scope.save = function() {
            var id;

            if (typeof $scope.address !== 'undefined') {
                id = $scope.address.id || $scope.address._id;
            }

            var successMessage = '';

            if (!id) {
                id = visitorLoginService.getVisitorId();
                $scope.address["visitor_id"] = id;
                visitorApiService.saveAddress($scope.address, successCallback);
                successMessage = 'New address was added with success';
            } else {
                $scope.address.id = id;
                visitorApiService.addressUpdate($scope.address, successCallback);
                successMessage = 'Address was changed with success';
            }

            function successCallback(response) {
                if (response.error === null) {
                    visitorLoginService.isLoggedIn(true).then(function(){
                        $scope._getAddresses();
                    });
                    $scope.message = commonUtilService.getMessage(null, 'success', successMessage);
                }
                $('#parent_popup_address').modal("hide");
            };
        };

        $scope.isActive = function(path) {
            return ($scope.activePath === path);
        };

        $scope.isDefault = function(id) {
            return (id == $scope.visitor.shipping_address_id || id == $scope.visitor.billing_address_id)
        }

    }
]);

