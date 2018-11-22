opiaControllers.controller('NetworkCtrl', ['$scope','$route','$location',function($scope,$route,$location){

  switch ($route.current.params.tab) {
    case "opiname":
      $scope.active = 1;
      break;
    case "ports":
      $scope.active = 2;
      break;
    case "shellaccess":
      $scope.active = 3;
      break;
    default:
      $scope.active = 0;
      break;
  }


}]);

opiaControllers.controller('Network__SettingsCtrl', ['$scope','$route','$location','$filter','NetworkAPI','Helpers','_',function($scope,$route,$location,$filter,Network,Helpers,_){
  // settings
  $scope.loadSettings = function(callback){
    $scope.settings = Network.getSettings(callback);
  }
  
  $scope.loadSettings();

  $scope.useStatic = function(){ return $scope.settings.type==='static'; }


  $scope.regexIP = function(){
    //console.log("Get regexIP");
    //return $scope.useStatic() ? Helpers.regexIP : /(.*)/ ;
    return Helpers.regexIP;
  }



  $scope.submit = function(form){ 
    if(form.$invalid) return;

    Network.setSettings($scope.settings,
    function(){
      if($scope.status != "error") $scope.status = 'success';
    },
    function(){
      $scope.status = 'error';
    });

  }
}]);

opiaControllers.controller('Network__PortCtrl', ['$scope','$route','$location','$filter','NetworkAPI','Helpers','_',function($scope,$route,$location,$filter,Network,Helpers,_){
	  // settings
	  $scope.loadSettings = function(callback){
      $scope.myport="1";
	    $scope.ports = {
	      '25':  Network.getPort({'param2':25}),
	      '80': Network.getPort({'param2':80}),
	      '143': Network.getPort({'param2':143}),
	      '443': Network.getPort({'param2':443}),
	      '587': Network.getPort({'param2':587}),
	      '993': Network.getPort({'param2':993}),
	      '2525': Network.getPort({'param2':2525})
	    };
      $scope.myport=true;
	  }
	  
	  $scope.loadSettings();

	  $scope.submit = function(form){ 
	    if(form.$invalid) return;

	    // save ports
	    _.each($scope.ports, function(value, key){
	      Network.setPort({ 'param2':key }, { 
	        'enabled': value.enabled>0 ? 'True' : 'False'
	      },
	      function() {
	    	  if($scope.status != "error") $scope.status = 'success';
	      },
	      function() {
	          $scope.status = 'error';
	      });
	    });
	  }

}]);

opiaControllers.controller('Network__OpiNameCtrl', ['$scope','$route','$location','$filter','NetworkAPI','SystemAPI','Helpers','_',function($scope,$route,$location,$filter,Network,System,Helpers,_){

  $scope.checkFqdn = function(){
    Network.checkFqdn({'fqdn':$scope.settings.opiname+"."+$scope.settings.domain},
      function(data){
        $scope.onForm.opiname.$dirty=true;
        if (data.isValid) {
          $scope.onForm.opiname.$setValidity("remote-ok",true);
        } else {
          $scope.onForm.opiname.$setValidity("remote-ok",false);
        }
      }
    );
  }

  $scope.getAvailableDomains = function(callback){
    Network.getDomains(function(response) {
      if (response.status) {
        $scope.availabledomains = response.availabledomains;
      } else {
        $scope.availabledomains = $scope.settings.domain;
      }
    });
  }

  // settings
  $scope.loadSettings = function(callback){
    $scope.settings = Network.getOpiName(callback);
    $scope.CertSettings = Network.getCertConfig(callback);
    // make sure private key is never shown
    $scope.CertSettings.CustomKeyVal = "";
    $scope.system = System.getUnitid();
  }
  $scope.loadSettings();
  $scope.getAvailableDomains();    

  $scope.regexOpiname = function(){
	    return Helpers.regexOpiname;
  }

  $scope.regexFQDN = function(){
      return Helpers.regexFQDN;
  }


  $scope.submit = function(form){ 
    if(form.$invalid) return;

    if (typeof $scope.CertSettings.CustomKeyVal === "undefined") {
      CustomKey = "";
    } else {
      CustomKey = $scope.CertSettings.CustomKeyVal;
    }
    console.log("Cert Dirty: " + form.CustomCert.$dirty);
    console.log("Key Pristine: " + form.CustomKey.$pristine);

    /*
    if ( form.CustomCert.$dirty && form.CustomKey.$pristine ) {
      // Cert updated, require a key also
      console.log("Abort, key required");
      form.CustomKey.$setValidity("empty",false);
      return false;
    }
    */

    Network.setOpiName({
        'name':$scope.settings.opiname,
        "dnsenabled":$scope.settings.dnsenabled,
        "domain":$scope.settings.domain,
        'CertType':$scope.CertSettings.CertType,
        'CustomCertVal':$scope.CertSettings.CustomCertVal,
        'CustomKeyVal':CustomKey
      }, function(data){
      if ( $scope.status != 'error') {
        $scope.status = 'success';
      }
      if (data.errmsg) {
        $scope.status = 'error';
        $scope.errormsg = data.errmsg;
      }
    }, function(data){
      $scope.status = 'error';
      $scope.errormsg = data.data;
    });

    if (! $scope.CertSettings.CustomKeyVal ) {
      $scope.CertSettings.CustomKeyVal = "";
    }
    /*
    Network.setCertConfig({'CertType':$scope.CertSettings.CertType,'CustomCertVal':$scope.CertSettings.CustomCertVal,'CustomKeyVal':$scope.CertSettings.CustomKeyVal}, function(data) {
      if ( $scope.status != 'error' ) {
        $scope.status = 'success';
      }
      if (data.errmsg) {
        $scope.status = 'error';
        $scope.errormsg = data.errmsg;
      }

    }, function(msg){
      $scope.status = 'error';
      if (msg['data'][1]) {
        $scope.errormsg = "Error: " + msg['data'][1];
      }

    });
    */
  }

  $scope.changeRadio = function() {
    if( $scope.CertSettings.CertType == "LETSENCRYPT") {
      $scope.showLEnote = true;
    } else {
      $scope.showLEnote = false;
    }
  }
}]);


opiaControllers.controller('Network__ShellCtrl', ['$scope','$route','$location','$filter','ShellAPI','_',function($scope,$route,$location,$filter,Shell,_){
	  // settings

  $scope.loadSettings = function(callback){
	$scope.settings = Shell.get(callback);
  }

  $scope.loadSettings();

  $scope.submit = function(form){
    if(form.$invalid) return;

    $scope.settings.$save(function(){
        if($scope.settings.status == true) {
          $scope.status = 'success';
        } else {
        	$scope.status = 'error';
        }
      }, function(){
        $scope.status = 'error';
      })
  }
}]);

