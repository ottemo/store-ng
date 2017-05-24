angular.module('commonModule')

    .service('mediaApiService', ['$resource', 'REST_SERVER_URI', function($resource, REST_SERVER_URI) {
        return $resource(REST_SERVER_URI, {}, {
            'getSizes': {
                method: 'GET',
                url: REST_SERVER_URI + '/config/value/general.app.image_sizes'
            },
            'getMediaPath': {
                method: 'GET',
                url: REST_SERVER_URI + '/config/value/general.app.media_base_url'
            }
        });
    }]);