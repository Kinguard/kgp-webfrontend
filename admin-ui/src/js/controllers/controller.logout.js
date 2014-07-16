opiaControllers.controller('LogoutCtrl', ['$scope','$rootScope','UserService',function($scope,$rootScope,User){
  $scope.logout = function(){ 
    User.logout(function(){
      location.href = '/?logout=true';
    });
  }
}]);
