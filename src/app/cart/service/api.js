angular.module("cartModule")

    /*
     *  cartApiService interaction service
     */
    .service("cartApiService", [
        "$resource",
        "commonUtilService",
        "REST_SERVER_URI",
        function (
            $resource,
            commonUtilService,
            REST_SERVER_URI
        ) {

        return $resource(REST_SERVER_URI, {}, {
            "add": {
                method: "POST",
                url: REST_SERVER_URI + "/cart/item"
            },
            "remove": {
                method: "DELETE",
                params: {itemIdx: "@itemIdx"},
                url: REST_SERVER_URI + "/cart/item/:itemIdx"
            },
            "info": {
                method: "GET",
                url: REST_SERVER_URI + "/cart",
                transformResponse: transformProduct
            },
            "update": {
                method: "PUT",
                params: {
                    itemIdx: "@itemIdx",
                    qty: "@qty"
                },
                url: REST_SERVER_URI + "/cart/item/:itemIdx/:qty"
            },
            "getProductsAttributes": {
                method: "GET",
                url: REST_SERVER_URI + "/products/attributes"
            }
        });

        /////////////////////////////////////////

        // hack to sort optionitems by key
        function transformProduct(data) {
            var resp = angular.fromJson(data);

            if (resp.result && resp.result.items && resp.result.items.length) {
                angular.forEach(resp.result.items, function(item) {
                    if (item.product && item.product.options) {
                        item.product.options = commonUtilService.processProductOptions(item.product.options)
                    }
                });
            }

            return resp;
        }
}]);
