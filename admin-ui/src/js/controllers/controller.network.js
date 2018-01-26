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

opiaControllers.controller('Network__OpiNameCtrl', ['$scope','$route','$location','$filter','NetworkAPI','Helpers','_',function($scope,$route,$location,$filter,Network,Helpers,_){
  // settings
  $scope.loadSettings = function(callback){
    $scope.settings = Network.getOpiName(callback);
    $scope.CertSettings = Network.getCertConfig(callback);
  }
  $scope.loadSettings();

  $scope.regexOpiname = function(){
	    return Helpers.regexOpiname;
  }


  $scope.submit = function(form){ 
    if(form.$invalid) return;

    Network.setOpiName({'name':$scope.settings.opiname,"dnsenabled":$scope.settings.dnsenabled,"domain":$scope.settings.domain }, function(){
      if ( $scope.status != 'error') {
        $scope.status = 'success';
      }
    }, function(){
      $scope.status = 'error';
    });

    if (! $scope.CertSettings.CustomKeyVal ) {
      $scope.CertSettings.CustomKeyVal = "";
    }
    Network.setCertConfig({'CertType':$scope.CertSettings.CertType,'CustomCertVal':$scope.CertSettings.CustomCertVal,'CustomKeyVal':$scope.CertSettings.CustomKeyVal}, function() {
      if ( $scope.status != 'error' ) {
        $scope.status = 'success';
      }
    }, function(msg){
      $scope.status = 'error';
      if (msg['data'][1]) {
        $scope.errormsg = "Error: " + msg['data'][1];
      }

    });
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

