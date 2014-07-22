opiaControllers.controller('LogoutCtrl', ['$scope','$rootScope','UserService',function($scope,$rootScope,User){
  $scope.logout = function(){ 
    User.logout(function(){
    	console.log("Logout Controller");
      location.href = '/?logout=true';
    });
  }
}]);
