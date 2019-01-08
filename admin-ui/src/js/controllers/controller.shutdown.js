opiaControllers.controller('ShutdownCtrl', ['$scope','ShutdownAPI','$filter','UserService','$window',function($scope,Shutdown,$filter,User,$window){
  // settings

  /*
  $scope.loadSettings = function(callback){
    $scope.settings = Shutdown.get(callback);
    $scope.settings.action = "reboot";
  }
  $scope.loadSettings();
	*/
  $scope.settings = {};

  $scope.submit = function(form){
    if(form.$invalid) return;
    p_acttion = "";
    console.log("got form: " + form.$name);
    if(form.$name == "sdForm_reboot") {
    	newloc='templates/reboot.php';
    	p_action="reboot";
    } else {
    	newloc='templates/shutdown.php';
    	p_action="shutdown";
    }
    Shutdown.doAction({action : p_action},function(response){
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
