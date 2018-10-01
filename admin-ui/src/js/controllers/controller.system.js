opiaControllers.controller('System__UpdateCtrl', ['$scope','SystemAPI','$filter',function($scope,System,$filter){


  loadSettings = function(callback){
    $scope.settings = System.getUpdateSettings(callback);
  }

  loadSettings();


  $scope.submit = function(form){
    if(form.$invalid) return;
    
    System.setUpdateSettings($scope.settings,function(){
      $scope.status = 'success';
    }, function(){
      $scope.status = 'error';
    })
  }

}]);


opiaControllers.controller('System__ProvidersCtrl', ['$scope','SystemAPI','LanguageAPI','Helpers','$filter','_',function($scope,System,l10n,helpers,$filter,_){

  $scope.services = {};
  $scope.hasText = function(provider,section,key) {
    // remove whitespaces and make lowercase.
    provider = helpers.stripandLowercase(provider);
    member = [provider,section,key];
    if ( (helpers.hasMember($scope.lang,member)) && ($scope.lang[provider][section][key] != "") ) {
      return true;
    } else {
      return false;
    }
  }    

  $scope.getText = function(provider,section,key) {
    // remove whitespaces and make lowercase.
    provider = helpers.stripandLowercase(provider);
    if ($scope.hasText(provider,section,key)) {
      return $scope.lang[provider][section][key];
    } else {
      return key;
    }
  }
  $scope.getServices = function(provider) {
    // remove whitespaces and make lowercase.
    provider = helpers.stripandLowercase(provider);

    member = [provider,"services"];
    if (! helpers.hasMember($scope.lang,member) ){
      return false;
    }
    return $scope.lang[provider]["services"];
  }

  loadSettings = function(callback){
    System.getModuleProviders(function(data){
      $scope.lang = {};
      $scope.providerdata = {};
      $scope.providers = {};
      _.each(data.providers, function(str_provider){
        provider = helpers.stripandLowercase(str_provider);
        $scope.providers[provider] = str_provider;
        $scope.providerdata[provider] = System.getModuleProviderInfo({param2:provider});
        $scope.lang[provider] = l10n.load({section:"moduleproviders",id:provider});        
      });

    });
  }

  loadSettings();


  $scope.submit = function(form){
    console.log("submitting form with provider: " + form.provider);
    if(form.$invalid) return;
    System.updateModuleProviders($scope.providerdata[form.provider],function(){
      form.status = 'success';
    }, function(){
      form.status = 'error';
    })
    
  }

}]);
