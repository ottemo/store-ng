/*
 *  categoryApiService interaction service
 */
angular.module("categoryModule")

.service("categoryApiService", [
    "$resource",
    "commonUtilService",
    "mediaService",
    "REST_SERVER_URI",
    function(
        $resource,
        commonUtilService,
        mediaService,
        REST_SERVER_URI
    ) {

        return $resource(REST_SERVER_URI, {}, {
            "getProductsByCategoryId": {
                method: "GET",
                url: REST_SERVER_URI + "/category/:categoryID/products",
                transformResponse: transformProductList
            },

            //REFACTOR: the resp.result.products here are never used!
            "load": {
                method: "GET",
                params: {
                    id: "@id"
                },
                url: REST_SERVER_URI + "/category/:id",
                transformResponse: transformCategory
            },
            "getCountProducts": {
                method: "GET",
                params: {
                    action: "count"
                },
                url: REST_SERVER_URI + "/category/:categoryID/products"
            },
            "getCategories": {
                method: "GET",
                url: REST_SERVER_URI + "/categories/tree"
            },
            "getLayered": {
                method: "GET",
                url: REST_SERVER_URI + "/category/:categoryID/layers"
            },
            "getBestSellers": {
                method: "GET",
                params: {
                    period: "week"
                },
                url: REST_SERVER_URI + "/rts/bestsellers"
            }
        });

        ////////////////////////////////

        function transformCategory(data) {
            var resp = angular.fromJson(data);
            if (resp.result && resp.result.products) {
                resp.result.products = processProductList(resp.result.products);
            }

            return resp;
        }

        function transformProductList(data) {
            var resp = angular.fromJson(data);
            if (resp.result) {
                resp.result = processProductList(resp.result);
            }

            return resp;
        }

        function processProductList(products) {
            products.forEach(function(product) {

                // Move default product image to the first position in images list
                if (product.default_image && product.image && product.image.length > 1) {
                    mediaService.sortProductImages(product);
                }

                // only perfrom assignment if options exist on the object
                if (product.options) {
                    product.options = commonUtilService.processProductOptions(product.options);
                }
            });

            return products;
        }
    }
]);

