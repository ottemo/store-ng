angular.module('pdpModule')
/**
 *  pdpProductOptionsService applies custom options to a product
 */
    .service('pdpProductOptionsService', [
        '_',
        'MAX_INT',
        function (_) {

            return {
                applyOptions: applyOptions
            };

            /**
             * applyOptions updates current product attributes according to given product options
             */
            function applyOptions(product, optionSet) {
                if (product == undefined || product.type === 'configurable') return product;

                // Filtering out empty values in options
                var optionSetToApply = _.pickBy(optionSet, function(value) {
                    return value !== '' && value != undefined;
                });

                // Sorting product options accordingly to 'order' field
                var applyOptionsOrder = [];
                _.forEach(optionSetToApply, function(optionValue, optionKey) {
                    var productOption = _.find(product.options, { key: optionKey });

                    // Default order - max integer
                    var orderValue = MAX_INT;

                    if (productOption.order !== undefined) {
                        orderValue = parseInt(productOption.order);
                    }

                    // Encoding key order to string '0000000000000001 [option name]'
                    var key = _.padStart(orderValue, 16, '0') + ' ' + optionKey;
                    applyOptionsOrder.push(key);
                });
                applyOptionsOrder.sort();

                // Saving start price for a case of percentage price modifier
                var startPrice = product.price;

                // Loop over applied options in right order
                _.forEach(applyOptionsOrder, function(key) {
                    var optionName = key.slice(key.indexOf(' ') + 1);
                    var optionValueSet = optionSetToApply[optionName];

                    var productOption = _.find(product.options, { 'key': optionName });
                    applyOptionModifiers(product, productOption, startPrice);

                    // If product option value has predefined values, then checking their modifiers
                    if (productOption.options !== undefined) {

                        // Option value set can be single or multi-value
                        // Making it uniform
                        if (!_.isArray(optionValueSet)) {
                            optionValueSet = [optionValueSet];
                        }

                        // Loop over option values
                        _.forEach(optionValueSet, function(itemOptionValueSet) {
                            var productOptionValue = _.find(productOption.options, { 'key': itemOptionValueSet });
                            applyOptionModifiers(product, productOptionValue, startPrice);
                        });
                    }
                });

                // Filtering options applicable to product qty value
                var optionSetToApplyForStock = _.pickBy(optionSetToApply, function(optionValue, optionKey) {
                    return Boolean(_.find(product.options, { 'key': optionKey }).controls_inventory);
                });

                // Applying options to product Qty
                if (!_.isEmpty(optionSetToApplyForStock)) {
                    product.qty = _.reduce(product.inventory, function(totalQty, stockRecord) {
                        var qty = 0;
                        if (_.isMatch(stockRecord.options, optionSetToApplyForStock)) {
                            qty = stockRecord.qty;
                        }
                        return totalQty + qty;
                    }, 0);
                }

                // Loop over product option values and mark sold out values
                _.forEach(product.options, function(option) {
                    if (!option.controls_inventory) return;

                    var optionSetToCheck = _.clone(optionSetToApplyForStock);
                    _.forEach(option.options, function(optionValue) {
                        optionSetToCheck[option.key] = optionValue.key;
                        optionValue._soldOut = !isOptionSetInStock(optionSetToCheck, product.inventory);
                    });
                });

                return product;
            }

            function isOptionSetInStock(optionSet, inventory) {
                var isInStock = false;
                _.forEach(inventory, function(stockRecord) {
                    if (stockRecord.qty > 0 && _.isMatch(stockRecord.options, optionSet)) {
                        isInStock = true;
                        return false;
                    }
                });

                return isInStock;
            }

            function applyOptionModifiers(product, optionToApply, startPrice) {
                // price modifier
                var optionPrice = String(optionToApply.price);
                if (optionPrice !== '' &&
                    _.trim(optionPrice, '1234567890+-%') === '') {

                    var isPercent = false,
                        isDelta = false;

                    optionPrice = _.trim(optionPrice);
                    if (_.endsWith(optionPrice, '%')) {
                        isPercent = true;
                        _.trimEnd(optionPrice, '%');
                    }

                    var priceValue;
                    if (_.startsWith(optionPrice, '+')) {
                        isDelta = true;
                        optionPrice = _.trimStart(optionPrice, '+');
                        priceValue = parseFloat(optionPrice);
                    } else if (_.startsWith(optionPrice, '-')) {
                        isDelta = true;
                        optionPrice = _.trimStart(optionPrice, '-');
                        priceValue = -1 * parseFloat(optionPrice);
                    } else {
                        priceValue = parseFloat(optionPrice);
                    }

                    if (isPercent) {
                        product.price += startPrice * priceValue / 100;
                    } else if (isDelta) {
                        product.price += priceValue;
                    } else {
                        product.price = priceValue;
                    }
                }

                // sku modifier
                var skuModifier = optionToApply.sku;
                if (skuModifier != undefined && skuModifier !== '' && _.trim(skuModifier) !== '') {
                    if (_.startsWith(skuModifier, '-') || _.startsWith(skuModifier, '_')) {
                        product.sku += skuModifier;
                    } else {
                        product.sku = skuModifier;
                    }
                }
            }
        }
    ]
);