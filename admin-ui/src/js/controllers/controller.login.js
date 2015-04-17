opiaControllers.controller('LoginCtrl', ['$scope','$rootScope','UserService','$timeout',function($scope,$rootScope,User,$timeout){
  $scope.login = {};
  $scope.status;
  $scope.autofocus = true;

  var actions = {
    trying: function(){
      $scope.status = 'trying';
      $scope.loginError = false;
    },
    success: function(data){
      $scope.status = 'success';
      
    },
    error: function(data,status) {
      $scope.status = 'error';
      $scope.loginError = true;
    }
  };

  $scope.tryLogin = function(){
    actions.trying();
    var o = angular.extend({"login":$scope.login}, actions);
    User.login(o);
  };
  

}]);