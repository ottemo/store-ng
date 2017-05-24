angular.module("categoryModule")

/**
 *  categoryService implementation
 *  Saves in the tree a categories list. Used for the breadcrumbs
 */
.service("categoryService", [
    "$location",
    "$q",
    "commonRewriteService",
    "pdpApiService",
    "pdpProductService",
    "SEARCH_KEY_NAME",
    "categoryApiService",
    function(
        $location,
        $q,
        commonRewriteService,
        pdpApiService,
        pdpProductService,
        SEARCH_KEY_NAME,
        categoryApiService
    ) {

        var tree = [];
        var type = "category";

        var bestSellersDeferred = $q.defer();
        var bestSellersPromise = bestSellersDeferred.promise;
        var AMOUNT_BEST_SELLERS = 4;

        requestBestSellers();

        return {
            getUrl: getUrl,
            setTree: setTree,
            getTree: getTree,
            getChainCategories: getChainCategories,
            setFiltersInLocation: setFiltersInLocation,
            searchProducts: searchProducts,
            getSubMenuItem: getSubMenuItem,
            getBestSellers: getBestSellers
        };

        //////////////////////////////////////////

        // Make an initial request to obtain a list of best sellers
        function requestBestSellers() {
            categoryApiService.getBestSellers().$promise.then(function(response) {
                    if (response.error === null && response.result !== null) {

                        var bestSellers = response.result.slice(0, AMOUNT_BEST_SELLERS);
                        var bestSellersIds  = _.map(bestSellers, function(bestSeller) {
                            return bestSeller.pid;
                        }).join(',');

                        var params = {
                            _id: bestSellersIds,
                            extra: 'name,price,sale_prices,strikethrough_price'
                        };

                        pdpApiService.getProducts(params).$promise
                            .then(function(response) {
                                if (response.error === null && response.result) {
                                    var bestSellersProducts = response.result;

                                    _.each(bestSellersProducts, function(bestSeller) {
                                        bestSeller['Url'] = pdpProductService.getUrl(bestSeller.ID);
                                    });
                                    bestSellersDeferred.resolve(bestSellersProducts);
                                } else {
                                    bestSellersDeferred.resolve([]);
                                }
                            });
                    } else {
                        bestSellersDeferred.resolve([]);
                    }
                });
        }

        function getUrl(id) {
            var url;
            url = commonRewriteService.getRewrite(type, id);

            if (!url) {
                url = type + "/" + id;
            }

            return "/" + url;
        }

        function setTree(categories) {
            // Attach urls to the item, and its children
            tree = _.map(categories, function(item){
                item = _applyUrl(item);
                if (item.child) {
                    item.child = setTree(item.child);
                }
                return item;
            });

            return tree;
        }

        function _applyUrl(item) {
            item.url = getUrl(item.id);
            return item;
        }

        function getTree() {
            return tree;
        }

        function getSubMenuItem(subMenuItems, id, list) {
            var found, i, tmpList;

            if (subMenuItems) {

                for (i = 0; i < subMenuItems.length; i += 1) {

                    tmpList = list;
                    tmpList.push(subMenuItems[i]);

                    if (subMenuItems[i].id === id) {
                        return [subMenuItems[i]];
                    }

                    found = getSubMenuItem(subMenuItems[i].child, id, tmpList);

                    if (found instanceof Array && found.length > 0) {
                        found.push(subMenuItems[i]);
                        return found;
                    }
                }
            }

            return [];
        }

        /**
         *
         * @param {string} id
         * @returns {Array}
         */
        function getChainCategories(id) {
            var list = [];

            list = getSubMenuItem(tree, id, list);

            return list.reverse();
        }

        function setFiltersInLocation(path, filter) {
            // removes the  "#" in the begin string
            var pathClear = path.trim('#');

            $location.$$path = pathClear;
            $location.$$url = pathClear;

            $location.search(filter);
        }

        function searchProducts(searchText, redirect) {
            var params = SEARCH_KEY_NAME + "=~" + searchText.replace(/\s/g, ',');
            var path = (redirect) ? redirect : $location.path();
            setFiltersInLocation(path, params);
        }

        function getBestSellers() {
            return bestSellersPromise.then(function(bestSellers) {
                return bestSellers;
            })
        }
    }
]);

