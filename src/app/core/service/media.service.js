angular.module('commonModule')

/**
 * Media helper service
 */
    .service('mediaService', ['_', '$q', 'mediaApiService', function(_, $q, imagesApiService) {
        var SWATCH_EXT = '.png';
        var PRODUCT_IMAGE_PLACEHOLDER = '/images/placeholder.png';

        var mediaConfigDeferred = $q.defer();
        
        activate();

        //////////////////////////////

        /**
         * Gets media settings from the server
         * Resolves mediaParamsDeferred with an object:
         * { sizes: { small: '100x100', large: '500x500' }, mediaPath: '/media' }
         */
        function activate() {
            var sizesPromise = imagesApiService.getSizes().$promise;
            var mediaPathPromise = imagesApiService.getMediaPath().$promise;

            $q.all([sizesPromise, mediaPathPromise]).then(function(responses) {
                var sizesResponse = responses[0];
                var mediaPathResponse = responses[1];

                var sizes = {};
                var firstSize = {};

                if (sizesResponse.error === null && sizesResponse.result) {
                    var sizesArr = sizesResponse.result.split(',');

                    _.forEach(sizesArr, function(sizeItemStr, idx) {
                        var sizeItem = sizeItemStr.split(':');
                        if (sizeItem.length === 2) {
                            sizes[sizeItem[0].trim()] = sizeItem[1].trim();

                            // Save first size in a separate object
                            if (idx === 0) {
                                firstSize.key = sizeItem[0].trim();
                                firstSize.dimention = sizeItem[1].trim();
                            }
                        }
                    });
                }

                var mediaPath = '/media';
                if (mediaPathResponse.error === null && mediaPathResponse.result ) {
                    mediaPath = mediaPathResponse.result;
                }

                mediaConfigDeferred.resolve({
                    sizes: sizes,
                    mediaPath: mediaPath,
                    firstSize: firstSize
                });
            });
        }

        /**
         * Returns an url for a product image
         */
        function getProductImage(_id, mediaName, size, mediaParams) {
            var mediaNameWithSize = mediaName;
            if (size !== '') {
                var mediaNameParts = mediaName.split('.');
                var ext = mediaNameParts.pop();
                mediaNameWithSize = mediaNameParts.join('.') + '_' + mediaParams.sizes[size] + '.' + ext;
            }
            return mediaParams.mediaPath + '/image/Product/' + _id + '/' + mediaNameWithSize;
        }


        /**
         * Returns an url for a product image
         */
        function getCategoryImage(_id, mediaName, size, mediaParams) {
            var mediaNameWithSize = mediaName;
            if (size !== '') {
                var mediaNameParts = mediaName.split('.');
                var ext = mediaNameParts.pop();
                mediaNameWithSize = mediaNameParts.join('.') + '_' + mediaParams.sizes[size] + '.' + ext;
            }
            return mediaParams.mediaPath + '/image/Category/' + _id + '/' + mediaNameWithSize;
        }

        /**
         * Returns an url for a swatch item
         */
        function getSwatchImage(optionKey, selectionKey, mediaParams) {
            var swatchSize = '';
            if (mediaParams.sizes.swatch) {
                swatchSize = '_' + mediaParams.sizes.swatch;
            }
            return mediaParams.mediaPath + '/image/swatch/media/' + optionKey + '_' + selectionKey +
                swatchSize + SWATCH_EXT;
        }

        /**
         * Moves default product image to the first position in images list
         */
        function sortProductImages(product) {
            mediaConfigDeferred.promise.then(function(mediaConfig) {

                var defaultImagePath = getProductImage(product._id, product.default_image,
                    mediaConfig.firstSize.key, mediaConfig);

                var defaultImageIdx = _.findIndex(product.image, function(image) {
                    return image[mediaConfig.firstSize.key] === defaultImagePath;
                });

                if (defaultImageIdx !== -1) {
                    var defaultImage = product.image.splice(defaultImageIdx, 1);
                    product.image.unshift(defaultImage[0]);
                }
            });
        }

        return {
            getMediaConfig: function() {
                return mediaConfigDeferred.promise;
            },
            getProductImage: getProductImage,
            getCategoryImage: getCategoryImage,
            getSwatchImage: getSwatchImage,
            sortProductImages: sortProductImages,
            productImagePlaceholder: PRODUCT_IMAGE_PLACEHOLDER
        }
    }]);
