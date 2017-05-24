angular.module("coreModule")

    .directive('otPaginator', ['$location', function ($location) {
        return {
            restrict: 'E',
            scope: {
                'parent': '=object'
            },
            templateUrl: '/views/core/directives/ot-paginator.html',
            controller: function ($scope, $attrs) {

                /**
                 * Prepares array of pages
                 *
                 * @returns {Array}
                 */
                $scope.getPages = function () {
                    var current = $scope.parent.currentPage,
                        last = $scope.parent.pages,
                        delta = 2,
                        left = current - delta,
                        right = current + delta + 1,
                        range = [],
                        rangeWithDots = [],
                        l;

                    for (var i = 1; i <= last; i++) {
                        if (i == 1 || i == last || i >= left && i < right) {
                            range.push(i);
                        }
                    }

                    angular.forEach(range, function(i) {
                        if (l) {
                            if (i - l === 2) {
                                rangeWithDots.push(l + 1);
                            } else if (i - l !== 1) {
                                rangeWithDots.push('...');
                            }
                        }
                        rangeWithDots.push(i);
                        l = i;
                    });

                    return rangeWithDots;
                };

                $scope.isShow = function () {
                    if ($scope.parent.pages <= 1 || $scope.parent.clickMore) {
                        return false;
                    }

                    return true;
                };

                /**
                 * Gets class for item of paginator
                 *
                 * @param {string} page
                 * @returns {string}
                 */
                $scope.getClass = function (page) {
                    var _class;
                    _class = "";

                    if (page === parseInt(($scope.parent.currentPage + 1), 10)) {
                        _class = 'active';
                    } else {
                        if ("prev" === page && $scope.parent.currentPage === 0) {
                            _class = 'disabled';
                        } else if ("next" === page && $scope.parent.currentPage + 1 >= $scope.parent.pages) {
                            _class = 'disabled';
                        }
                    }

                    return _class;
                };

                $scope.showMoreBtn = function () {
                    if ($attrs.hideMoreBtn) {
                        return false;
                    }

                    var countLoadedGoods;
                    countLoadedGoods = ($scope.parent.currentPage + 1) * $scope.parent.itemsPerPage;

                    if (countLoadedGoods >= $scope.parent.totalItems) {
                        return false;
                    }

                    return true;
                };

                $scope.loadMore = $scope.parent.loadMore;

                /**
                 * Gets URI for item of paginator
                 *
                 * @param {string} page
                 * @returns {string}
                 */
                $scope.getURI = function (page) {
                    var _page;
                    _page = 1;
                    switch (page) {
                        case 'prev':
                            if ($scope.parent.currentPage !== 0) {
                                _page = $scope.parent.currentPage;
                            }
                            break;
                        case 'next':
                            if ($scope.parent.currentPage < $scope.parent.pages - 1) {
                                _page = $scope.parent.currentPage + 2;
                            } else {
                                _page = $scope.parent.pages;
                            }
                            break;
                        default:
                            _page = page;
                    }
                    $location.search("p", _page);
                };
            }
        };
    }]);