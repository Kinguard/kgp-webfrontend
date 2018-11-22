opiaControllers.controller('SystemCtrl', ['$scope','$route','$location',function($scope,$route,$location){
  console.log($route.current.params.tab);  
  switch ($route.current.params.tab) {
    case "updatesettings":
      $scope.active = 0;
      break;
    case "moduleproviders":
      $scope.active = 1;
      break;
    default:
      $scope.active = 0;
      break;
  }

}]);

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


opiaControllers.controller('System__ProvidersCtrl', ['$scope','SystemAPI','LanguageAPI','ModalService','Helpers','$filter','_',function($scope,System,l10n,Modals,helpers,$filter,_){

  $scope.services = {};
  $scope.hasText = function(provider,section,key) {
    // remove whitespaces and make lowercase.
    provider = helpers.stripandLowercase(provider);
    section  = helpers.stripandLowercase(section);
    key      = helpers.stripandLowercase(key);
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
    section  = helpers.stripandLowercase(section);
    key      = helpers.stripandLowercase(key);
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

  $scope.getController = function(provider) {
    // remove whitespaces and make lowercase.
    provider = helpers.stripandLowercase(provider);

    member = [provider,"controller"];
    if (! helpers.hasMember($scope.lang,member) ){
      return false;
    }
    return $scope.lang[provider]["controller"];
  }

  loadSettings = function(callback){
    
    /*
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
    */
      $scope.lang = {};
      $scope.providerdata = {};
      $scope.providers = {};
      System.getUnitid(function(data) {
        var unitid = "";
        if (data.provider) {
          provider = helpers.stripandLowercase(data.provider);
        }
        $scope.providers[provider] = data.provider;
        //console.log($scope.providers);
        if (data.unitid ) {
          unitid = data.unitid;
        } else {
          // no unitid, do we hava backup?
          if (data.unitidbak ) {
            unitid = data.unitidbak;
          }
        }
        $scope.providerdata[provider] = { "enabled" : data.enabled, "unitid" : unitid, "showmore" : false };
        $scope.lang[provider] = l10n.load({section:"moduleproviders",id:provider});        
      })

  }

  $scope.status = 'init';
  loadSettings();

  $scope.submit = function(form){

    console.log("submitting form with provider: " + form.provider);
    if(form.$invalid) return;
    System.updateModuleProviders($scope.providerdata[form.provider],function(){
      form.status = 'success';
    }, function(){
      form.status = 'error';
    });
  }

  $scope.SaveChanges = function(form)
  {
    // console.log("Saving form with provider: " + form.provider);
    // console.log($scope.providerdata[form.provider]);

    var modal = Modals.open('./templates/system/form--set-master-password.html', { 
      headline: 'Enter Master Password',
      unitid: $scope.providerdata[form.provider].unitid,
      enabled: $scope.providerdata[form.provider].enabled
      }
    );

  }

}]);

opiaControllers.controller('System__SetMasterPasswordCtrl', ['$scope','SystemAPI','$timeout',function($scope,System,$timeout){

  $scope.status = 'init';
  $scope.enabled = _.isObject($scope.modalParams) ? $scope.modalParams.enabled : false;
  unitid = _.isObject($scope.modalParams) ? $scope.modalParams.unitid : "";

  $scope.submit = function(form){

    if(form.$invalid) return;

    System.setUnitid({ unitid:unitid , mpwd:$scope.mpwd, enabled:$scope.enabled}, function(){
      $scope.status = 'success';
      
      if($scope.isModal){
        $timeout(function(){
          $scope.$modalInstance.close('changed');
        },3000);
      }
      // reset fields when saved
    }, function(resp){
      $scope.status = 'error';
      console.log(resp);
      if (resp.data.errormsg) {
        $scope.errormsg = resp.data.errormsg;
      }
    });
  }
}]);