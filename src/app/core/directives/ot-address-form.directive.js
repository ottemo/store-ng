angular.module('coreModule')

.directive('otAddressForm', [
    'coreCountryService', 'coreStateService',
    function(coreCountryService, coreStateService) {
        return {
            scope: {
                formCtrl: '=',
                formModel: '=',
                formDisabled: '=',
                onSubmit: '&'
            },
            restrict: 'E',
            templateUrl: '/views/core/directives/ot-address-form.html',
            transclude: true,
            link: function(scope, elem, attrs) {
                scope.countries = coreCountryService;
                scope.states = coreStateService;
                scope.twoColumnsMode = 'twoColumnsMode' in attrs;

                // a uid to prefix to all for/id combos
                scope.uid = ('' + Math.random()).substr(2,10);

                scope.hasErr = function(field) {
                    return scope.formCtrl[field].$invalid && (scope.formCtrl.$submitted || scope.formCtrl[field].$touched);
                };
            }
        };
    }
]);

