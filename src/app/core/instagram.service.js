angular.module("commonModule")

    .service("instagramService", [
        "$http",
        "$q",
        function ($http, $q) {
            var user_id = angular.appConfig.instagramClientId;
            var access_token = angular.appConfig.instagramClientToken;
            var defer = $q.defer();

            activate();

            function activate() {
                var endpoint = [
                    'https://api.instagram.com/v1/users/',
                    user_id,
                    '/media/recent/?',
                    '?count=99',
                    '&callback=JSON_CALLBACK',
                    '&access_token=',
                    access_token
                ].join('');

                $http.jsonp(endpoint)
                    .success(function(response) {
                        defer.resolve(response.data);
                    })
                    .error(function(response) {
                        defer.reject(response.data);
                    })
            }

            function fetchPhotos() {
                return defer.promise;
            }

            return {
                "fetchPhotos": fetchPhotos
            };
        }
    ]
);
