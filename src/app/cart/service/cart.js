/**
 *  cartService interaction service
 */
angular.module('cartModule')

.service('cartService', [
    '$q', '_', 'cartApiService', 'checkoutApiService',
    function ( $q, _, cartApiService, checkoutApiService) {

        var items = [],
            visitorId;

        var isActivated = false;
        var isSalePricesEnabled = false;

        /**
         * Service initialization
         * Can be called multiple times
         */
        function init() {
            var initDeferred = $q.defer();

            if (!isActivated) {
                isActivated = true;

                // Check if sale prices enabled
                cartApiService.getProductsAttributes().$promise
                    .then(function(response) {
                        if (response.error === null) {
                            var attributes = response.result;
                            var salePricesAttr = _.filter(attributes, { Attribute: 'sale_prices' });
                            isSalePricesEnabled = (salePricesAttr.length > 0);
                        }
                    })
                    .then(function() {
                        loadCartInfo()
                            .then(function() {
                                initDeferred.resolve();
                            });
                    });

            } else {
                initDeferred.resolve();
            }

            return initDeferred.promise;
        }

        function getSalePricesEnabled() {
            return isSalePricesEnabled;
        }

        function getItems() {
            return items;
        }

        function getItem(idx) {
            return _.filter(items, { 'idx': idx})[0];
        }

        function getItemsForMiniCart() {
            return items.slice(-3).reverse();
        }

        function hasSubscriptionItems() {
            return !!_.filter(items, isActiveSubscription).length;

            function isActiveSubscription(item) {
                return item.options && item.options.subscription && item.options.subscription !== 'just_once';
            }
        }

        function hasSalePricesInItems() {
            if (!getSalePricesEnabled()) return false;

            return !!_.filter(items, hasSalePrice).length;

            function hasSalePrice(item) {
                return item.product && item.product.salePrice !== undefined;
            }
        }

        function getSubtotal() {
            return _.reduce(items, function(subtotal, item) {
                return subtotal + item.qty * item.product.price;
            }, 0);
        }

        /**
         * Total unique goods
         *
         * @returns {number}
         */
        function getCountItems() {
            return items.length;
        }

        /**
         * Total qty of items
         *
         * @returns {number}
         * */
        function getTotalQuantity() {
            return _.reduce(items, function(totalQty, item) {
                return totalQty + +item.qty;
            }, 0);
        }

        /**
         * Reloads the cart and updates the cached cart that is served from init
         * @return {[type]} [description]
         */
        function reload() {
            return loadCartInfo();
        }

        function loadCartInfo() {
            return cartApiService.info().$promise
                .then(function (cartInfo) {
                    if (cartInfo.error === null) {
                        items = cartInfo.result.items || [];
                        angular.forEach(items, function(item) {
                            item.hasOptions = !angular.equals({}, item.options);
                        });

                        visitorId = cartInfo.result["visitor_id"];

                        // Load sale prices from checkout If they are enabled
                        if (isSalePricesEnabled) {
                            return checkoutApiService.info().$promise
                                .then(function(checkoutInfo) {
                                    if (checkoutInfo.error === null) {
                                        var calculationsForCartItems = checkoutInfo.result.info.calculation;
                                        applySalePrices(calculationsForCartItems);
                                    }

                                    return cartInfo;
                                })
                        } else {
                            return cartInfo;
                        }
                    } else {
                        items = [];
                        visitorId = undefined;
                        return cartInfo;
                    }
                });
        }

        function applySalePrices(calculations) {
            angular.forEach(items, function(item) {
                var itemCalculation = calculations[item.idx];
                if (itemCalculation && itemCalculation['SPA']) {
                    item.product.salePrice = itemCalculation['GT'] / item.qty;
                }
            });
        }

        function getSalePriceSubtotal() {
            return _.reduce(items, function(subtotal, item) {
                var currentPrice = (item.product.salePrice !== undefined) ? item.product.salePrice : item.product.price;
                return subtotal + item.qty * currentPrice;
            }, 0);
        }

        function add(productId, qty, options) {
            var params = {
                'pid': productId,
                'qty': qty
            };

            return cartApiService.add(params, options).$promise
                .then(function(response) {
                    if (response.error === null) {
                        return loadCartInfo();
                    } else {
                        return response;
                    }
                });
        }

        function remove(itemIdx, skipRefresh) {
            return cartApiService.remove({'itemIdx': itemIdx}).$promise
                .then(function () {
                    if (!skipRefresh) {
                        return loadCartInfo();
                    }
                });
        }

        function update(itemIdx, qty) {
            return cartApiService.update({
                'itemIdx': itemIdx,
                'qty': qty
            }).$promise
                .then(function () {
                    return loadCartInfo();
                }
            );
        }

        return {
            init: init,
            reload: reload,
            add: add,
            remove: remove,
            update: update,
            getItem: getItem,
            getItems: getItems,
            getItemsForMiniCart: getItemsForMiniCart,
            hasSubscriptionItems: hasSubscriptionItems,
            hasSalePricesInItems: hasSalePricesInItems,
            getCountItems: getCountItems,
            getTotalQuantity: getTotalQuantity,
            getSubtotal: getSubtotal,
            getSalePriceSubtotal: getSalePriceSubtotal,
            getSalePricesEnabled: getSalePricesEnabled
        };
    }
]);
