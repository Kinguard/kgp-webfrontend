opiaControllers.controller('MeCtrl', ['$scope',function($scope){

}]);




opiaControllers.controller('Me__UserProfileCtrl', ['$scope','UserService','UserAPI','Helpers','ModalService',function($scope,User,Users,Helpers,Modals){
  $scope.status = 'init';
  $scope.up = Users.get( {id:User.username} );
  $scope.isModal = function(){ return undefined; }


  $scope.submit = function(form){
    if(form.$invalid) return;
    $scope.up.$save(function(r){
      User.refresh(function(){
        $scope.status = 'success';
      });
    }, function(r){
      $scope.status = 'error';
    });
  }

  $scope.changePassword = function(){
    Modals.open('./templates/me/form--change-password.html', { 
      headline: 'Change Password'
    });
  }

}]);




opiaControllers.controller('Me__ChangePasswordCtrl', ['$scope','UserService','UserAPI','_','$timeout',function($scope,User,Users,_,$timeout){
  $scope.status = 'init';
  $scope.cp = {};
  $scope.editUser = $scope.isModal ? $scope.modalParams.editUser : {};

  $scope.editingUser = function(){
    return _.isObject($scope.modalParams) 
        && _.isObject($scope.editUser) 
        && $scope.editUser.id !== User.id;
  }

  $scope.submit = function(form){
    if(form.$invalid) return;

    var userid = $scope.editingUser() ? $scope.editUser.id : User.id;

    Users.changePassword({ id:userid }, $scope.cp, function(){
      $scope.status = 'success';
      
      if($scope.isModal){
        $timeout(function(){
          $scope.$modalInstance.close('changed');
        },3000);
      }
      // reset fields when saved
      $scope.cp = {}; 
      form.$setPristine();
    }, function(){
      $scope.status = 'error';
    });
  }
}]);