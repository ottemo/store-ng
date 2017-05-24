angular.module('pdpModule')

.directive('otSocialLinks', ['$location', '$sce', function($location, $sce) {
        return {
            restrict: 'E',
            scope: {
                image: '@',
                text: '@',
                title: '@',
                url: '@'

            },
            templateUrl: '/views/pdp/directives/ot-social-links.html',
            link: function(scope, element, attrs) {

                scope.googlePlus = 'googleplus' in attrs;
                scope.twitter = 'twitter' in attrs;
                scope.pinterest = 'pinterest' in attrs;
                scope.facebook = 'facebook' in attrs;

                scope.getPageUrl = function () {
                    if(scope.url === undefined){
                        return $location.absUrl();
                    }
                    else
                    {
                        var port = ($location.port()) ? (':' + $location.port()) : '';
                        return $location.protocol() + '://' + $location.host() + port + scope.url;
                    }
                }
            }
        };
    }
]);
