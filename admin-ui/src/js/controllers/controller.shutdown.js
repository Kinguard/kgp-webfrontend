opiaControllers.controller('ShutdownCtrl', ['$scope','ShutdownAPI','$filter','UserService','$window',function($scope,Shutdown,$filter,User,$window){
  // settings

  $scope.loadSettings = function(callback){
    $scope.settings = Shutdown.get(callback);
    $scope.settings.action = "reboot";
  }
  $scope.loadSettings();
	
  $scope.submit = function(form){
    if(form.$invalid) return;
    if(form.$name == "sdForm_reboot") {
    	newloc='templates/reboot.html';
    	$scope.settings.action="reboot";
    } else {
    	newloc='templates/shutdown.html';
    	$scope.settings.action="shutdown";
    }
    $scope.settings.$save(function(response){
        $scope.status = 'success';
        if(response.url) {
            User.reboot(response);
        } else {
            User.shutdown(response);
        }
        $window.location = newloc;
      }, function(){
        console.log("Error in shutdown controller"); 
      });
  }

}]);
