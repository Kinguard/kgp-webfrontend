opiaControllers.controller('MailCtrl', ['$scope','$route','$location',function($scope,$route,$location){
  $scope.tab = $route.current.params.tab;
  $scope.isTab = function(tabName){
    return ($scope.tab === tabName);
  }

}]);



opiaControllers.controller('Mail__SendCtrl', ['$scope','MailAPI','$filter',function($scope,Mail,$filter){
  // settings
  $scope.loadSettings = function(callback){
    $scope.settings = Mail.getSmtpSettings(callback);
  }
  $scope.loadSettings();



  $scope.submit = function(form){
    if(form.$invalid) return;

    Mail.setSmtpSettings($scope.settings, function(){
      $scope.status = 'success';
    }, function(){
      $scope.status = 'error';
    })
  }

}]);
