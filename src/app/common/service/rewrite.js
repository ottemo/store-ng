angular.module("commonModule")
/**
 *  commonRewriteService implementation
 */
    .service("commonRewriteService", [
        "$q",
        "commonApiService",
        '$location',
        function ($q, commonApiService, $location) {
            // Variables
            var rules, deferInit;

            // Functions
            var init, getRewrite;

            deferInit = $q.defer();

            init = function () {

                if (typeof rules !== "undefined") {
                    return deferInit.promise;
                }

                commonApiService.getRewriteUrls().$promise.then(
                    function (response) {
                        rules = response.result || [];
                        deferInit.resolve(rules);
                    }
                );

                return deferInit.promise;
            };

            getRewrite = function (type, id) {
                if (typeof  rules === "undefined") {
                    return false;
                }
                for (var i = 0; i < rules.length; i += 1) {
                    if (rules[i].Extra.type === type && rules[i].Extra.rewrite === id) {
                        return rules[i].Extra.url;
                    }
                }
                return false;
            };

            function getCategoryIdByUrl(url) {
                if (typeof  rules === "undefined") {
                    return null;
                }

                for (var i = 0; i < rules.length; i++) {
                    if ( rules[i].Extra.type === 'category' &&
                         rules[i].Extra.url === url ) {
                        return rules[i].Extra.rewrite;
                    }
                }

                return null;
            }

            return {
                "init": init,
                "getRewrite": getRewrite,
                "getCategoryIdByUrl": getCategoryIdByUrl
            };
        }
    ]
);
