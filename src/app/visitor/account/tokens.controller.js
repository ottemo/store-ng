angular.module("visitorModule")

.controller('visitorAccountTokensController', [
    '$scope',
    '$location',
    '_',
    'visitorLoginService',
    'visitorApiService',
    'checkoutService',
    'commonUtilService',
    function(
        $scope,
        $location,
        _,
        visitorLoginService,
        visitorApiService,
        checkoutService,
        commonUtilService
        ) {
        // General
        $scope.visitor = visitorLoginService.getVisitor();

        // Tokens List
        $scope.tokens = [];
        $scope.defaultToken = {};
        $scope.paymentMethods= {
            tokenAble: []
        };

        // Edit / Add Form
        $scope.creditCardForm = {
            model: {}
        };
        $scope.newCreditCardMessage = '';

        // Sidebar, refactor
        $scope.activePath = $location.path();

        //////////////////////////

        $scope.activate = function() {
            // BREADCRUMBS
            $scope.$emit('add-breadcrumbs', {
                'label': 'myAccount',
                'url': '/account'
            });
            $scope.$emit('add-breadcrumbs', {
                'label': 'Credit Cards',
                'url': '/account/creditcards'
            });

            // Redirect
            visitorLoginService.isLoggedIn()
                .then(function(isLoggedIn) {
                    if (!isLoggedIn) {
                        $location.path("/");
                    }
                });

            $scope.getTokens();

            checkoutService.loadPaymentMethods().then(function(methods){
                $scope.paymentMethods.tokenAble = _.filter(methods, { 'Tokenable': true });
            });
        }

        $scope.getEmptyCC = function() {
            return {
                number: '',
                cvc: '',
                expire_year: '',
                expire_month: ''
            }
        }

        $scope.getPaymentMethodName = function(methodCode) {
            var method = _.filter($scope.paymentMethods.tokenAble, {'Code': methodCode});
            return method[0] ? method[0].Name : methodCode;
        }

        $scope.getTokens = function() {
            visitorApiService.getTokens().$promise
                .then(function(response) {
                    $scope.tokens = response.result || [];
                    $scope.defaultToken = {};

                    _.forEach($scope.tokens, function(token){
                        if ($scope.visitor.token && token.ID === $scope.visitor.token._id) {
                            $scope.defaultToken = token;
                        }
                    });
                });
        }

        $scope.popUpOpen = function() {
            $('#credit-card-new-popup').modal("show");
            $scope.newCreditCardMessage = '';
            $scope.creditCardForm.controller.$setPristine();
            $scope.creditCardForm.controller.$setUntouched();
            $scope.creditCardForm.controller.$rollbackViewValue();
            $scope.creditCardForm.model.cc = $scope.getEmptyCC();
            $scope.creditCardForm.model.payment_method = $scope.paymentMethods.tokenAble[0].Code;
        }

        $scope.remove = function(id) {
            visitorApiService.deleteToken({'tokenID': id}).$promise
                .then(function () {
                    visitorLoginService.isLoggedIn(true).then(function(){
                        $scope.getTokens();
                        $scope.message = commonUtilService.getMessage(null, 'success', 'credit card was deleted');
                    });
                });
        }

        $scope.setDefaultCard = function (id) {
                visitorApiService.setDefaultToken({'tokenID': id}).$promise
                    .then(function () {
                        visitorLoginService.isLoggedIn(true).then(function(){
                            $scope.getTokens();
                        })
                    });
            }

        $scope.save = function() {
            visitorApiService.saveToken($scope.creditCardForm.model).$promise
                .then(function (response) {
                    if (response.error === null) {
                        $scope.getTokens();
                        $('#credit-card-new-popup').modal("hide");
                    } else {
                        $scope.newCreditCardMessage = commonUtilService.getMessage(response);
                    }
                });
        }

        $scope.isActive = function(path) {
            return ($scope.activePath === path)
        }

        $scope.parseDate = function(date) {
            if (typeof date !== 'string' || date.length != 4) {
                return date;
            }

            return date.substring(0, 2) + '/20' + date.substring(2);
        }

        $scope.isDefault = function (id) {
            if ($scope.visitor.token){
                return (id == $scope.visitor.token._id);
            } else {
                return false;
            }
        }

    }
]);
