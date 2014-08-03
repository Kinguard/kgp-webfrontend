opiaControllers.controller('UpdateCtrl', ['$scope','UpdateAPI','$filter',function($scope,Update,$filter){
  // settings
  $scope.loadSettings = function(callback){
    $scope.settings = Update.get(callback);
    console.log($scope.settings);
  }

  $scope.loadSettings();


  $scope.submit = function(form){
    if(form.$invalid) return;
    
    $scope.settings.$save(function(){
      console.log($scope.settings);
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
