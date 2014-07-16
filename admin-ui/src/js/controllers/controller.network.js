opiaControllers.controller('NetworkCtrl', ['$scope','$route','$location',function($scope,$route,$location){
  $scope.tab = $route.current.params.tab;
  $scope.isTab = function(tabName){
    return ($scope.tab === tabName);
  }

}]);



opiaControllers.controller('Network__SettingsCtrl', ['$scope','$route','$location','$filter','NetworkAPI','Helpers','_',function($scope,$route,$location,$filter,Network,Helpers,_){
  // settings
  $scope.loadSettings = function(callback){
    $scope.settings = Network.getSettings(callback);
    $scope.ports = {
      '25':  Network.getPort({'param2':25}),
      '143': Network.getPort({'param2':143}),
      '443': Network.getPort({'param2':443})
    };
  }
  $scope.loadSettings();


  $scope.useStatic = function(){ return $scope.settings.type==='static'; }

  $scope.regexIP = function(){
    return $scope.useStatic() ? Helpers.regexIP : /(.*)/ ;
  }


  $scope.submit = function(form){ 
    if(form.$invalid) return;

    Network.setSettings($scope.settings, function(){
      $scope.status = 'success';
    }, function(){
      $scope.status = 'error';
    });
    // save ports
    _.each($scope.ports, function(value, key){
      Network.setPort({ 'param2':key }, { 
        'enabled': value.enabled>0 ? 'True' : 'False'
      });
    });
  }

}]);



opiaControllers.controller('Network__OpiNameCtrl', ['$scope','$route','$location','$filter','NetworkAPI','Helpers','_',function($scope,$route,$location,$filter,Network,Helpers,_){
  // settings
  $scope.loadSettings = function(callback){
    $scope.settings = Network.getOpiName(callback);
  }
  $scope.loadSettings();


  $scope.submit = function(form){ 
    if(form.$invalid) return;

    Network.setOpiName($scope.settings, function(){
      $scope.status = 'success';
    }, function(){
      $scope.status = 'error';
    });
  }

}]);


