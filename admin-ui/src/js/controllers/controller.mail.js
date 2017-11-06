opiaControllers.controller('MailCtrl', ['$scope','$route','$location',function($scope,$route,$location){
  
  switch ($route.current.params.tab) {
    case "receive":
      $scope.active = 0;
      break;
    case "fetch-external":
      $scope.active = 1;
      break;
    case "send":
      $scope.active = 2;
      break;
    default:
      if($scope.user.isAdmin()) {
        $scope.active = 2;  
      } else {
        $scope.active = 0;
      }
      
      break;
  }

}]);



opiaControllers.controller('Mail__SendCtrl', ['$scope','MailAPI','Helpers','$filter',function($scope,Mail,Helpers,$filter){
  // settings
  $scope.loadSettings = function(callback){
    $scope.settings = Mail.getSmtpSettings(callback);
  }
  $scope.loadSettings();

  $scope.regexFQDN = function(){
	    return Helpers.regexFQDN;
  }


  $scope.submit = function(form){
    if(form.$invalid) return;

    Mail.setSmtpSettings($scope.settings, function(){
      $scope.status = 'success';
    }, function(){
      $scope.status = 'error';
    })
  }
}]);
