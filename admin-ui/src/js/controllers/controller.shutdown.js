opiaControllers.controller('ShutdownCtrl', ['$scope','ShutdownAPI','$filter','UserService','$window',function($scope,Shutdown,$filter,User,$window){
  // settings

  $scope.loadSettings = function(callback){
    $scope.settings = Shutdown.get(callback);
    $scope.settings.action = "reboot";
  }
  $scope.loadSettings();
	
  $scope.submit = function(form){
    if(form.$invalid) return;
    $scope.settings.$save(function(response){
        $scope.status = 'success';
        if(response.url) {
            User.reboot(response);
          	$window.location = 'templates/reboot.html';
        } else {
            User.shutdown(response);
          	$window.location = 'templates/shutdown.html';
        }
      }, function(){
        console.log("Error"); 
      });
  }

}]);
