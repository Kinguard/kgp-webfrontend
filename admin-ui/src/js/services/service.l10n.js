
opiaServices.factory('LanguageAPI', ['OPI','$resource',function(opi,$resource){

	var l10n = {};

	l10n.load = function(params) {
		if (! params.lang ) {
			params.lang = 'en';
		}
		//console.log("l10n using: ");
		//console.log(params);
		return $resource(
				opi.l10nUrl+':section/:id/:lang.js',
				params
			).get(
				function(){
					//console.log("l10n loaded for: " + params.id);
				},
				function(){
					console.log("Loading l10n failed for: " + params.id);	
				}
			);
		}

	return l10n;
}]);

