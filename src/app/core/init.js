angular.module('coreModule', [
	'ngSanitize'
])
.constant('_', window._)
.constant('MAX_INT', Math.pow(2, 53) - 1);