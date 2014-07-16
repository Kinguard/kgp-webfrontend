opiaControllers.controller('LogoutCtrl', ['$scope','$rootScope','UserService',function($scope,$rootScope,User){
  $scope.logout = function(){ 
    User.logout(function(){
      console.log("Redirecting from logout controller");
      location.href = '/?logout=true';
    });
  }
}]);