opiaControllers.controller('ShutdownCtrl', ['$scope','ShutdownAPI','$filter','UserService','$window',function($scope,Shutdown,$filter,User,$window){
  // settings
  $scope.loadSettings = function(callback){
    $scope.settings = Shutdown.get(callback);
  }

  $scope.loadSettings();



  $scope.submit = function(form){
	console.log("Shutdown clicked");
    if(form.$invalid) return;
    
    $scope.settings.$save(function(){
      $scope.status = 'success';
      console.log("Success");
      User.shutdown(function(){
          console.log("Shutdown logout");
          
          $window.location = 'templates/shutdown.html';
        });
    }, function(){
      console.log("Error");
    })
  }

}]);
