opiaControllers.controller('UpdateCtrl', ['$scope','UpdateAPI','$filter',function($scope,Update,$filter){
  // settings
  $scope.loadSettings = function(callback){
    $scope.settings = Update.get(callback);
  }

  $scope.loadSettings();



  $scope.submit = function(form){
    if(form.$invalid) return;
    
    $scope.settings.$save(function(){
      $scope.status = 'success';
    }, function(){
      $scope.status = 'error';
    })
  }

}]);
