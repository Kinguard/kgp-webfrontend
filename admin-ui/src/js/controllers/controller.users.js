opiaControllers.controller('UsersCtrl', ['$scope','$route','$location',function($scope,$route,$location){
  $scope.tab = $route.current.params.tab;
  $scope.isTab = function(tabName){
    return ($scope.tab === tabName);
  }

}]);




opiaControllers.controller('Users__UserListCtrl', ['$scope','UserAPI','ngTableParams','$filter','OPI','$timeout','Helpers','ModalService','UserService',function($scope,Users,ngTableParams,$filter,opi,$timeout,Helpers,Modals,UserService){
  $scope.loadUsers  = function(callback){
    $scope.users = Users.query(function() {
	    _.each($scope.users, function(user){
	        user['groups'] = Users.groups({id:user.id});
	      });
	    // make the callback, if any
	    if(_.isFunction(callback)) callback();
    });
  }
  
  $scope.loadUsers(function(){
    $scope.users = $filter('orderBy')($scope.users, 'displayname');
    $scope.setTableParams();
  });
  
  $scope.setTableParams = function(){
    $scope.tableParams = new ngTableParams({
      //sorting: { displayname: 'asc' },
      total: 1,
      count: $scope.users.length
    }, {
      counts: [],
      total: $scope.users.length, 
      getData: function($defer, params){
        // Sort by params.sorting()
        if(params.sorting()){ 
          $scope.users = $filter('orderBy')($scope.users, params.orderBy());
        }
        // output data list
        $defer.resolve($scope.users.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
    });
  }
  $scope.reloadTable = function(){
    $scope.tableParams.count($scope.users.length);
    $scope.tableParams.reload();
  }

  $scope.getUserGroups = function(user) {
	return _.map(user.groups, function(group){ return group.id });
  }

  $scope.submit = function(form){
    if($scope.editUser.id)
      return $scope.update(form);
    if($scope.newUser)
      return $scope.add(form);
  }


  $scope.userTypes = opi.userTypes;
  $scope.editUser = {};
  $scope.edit = function(user, exitIfEditing){
    if(exitIfEditing && $scope.editing(user)) return;
    if(user.id) $scope.new(null);
    $scope.editUser = angular.copy((user.id !== $scope.editUser.id) ? user : {});
  }
  $scope.editing = function(user){
    return (user.id === $scope.editUser.id);
  }
  
  $scope.update = function(form){
    if(form.$invalid || !$scope.editUser.id) return;
    // save
    Users.save({id:$scope.editUser.id}, $scope.editUser, function(){
      $scope.status = 'success';
      $scope.loadUsers(function(){
        $scope.setRowClass();
        $scope.reloadTable();
        $scope.edit({});
      });
    }, function(r){
      $scope.status = 'error';
      $scope.setRowClass();
    });
  }

  
  $scope.rowClass = [];
  $scope.setRowClass = function(userid, value, resetdelay){
    if(!userid)     userid     = $scope.editUser.id;
    if(!value)      value      = $scope.status;
    if(!resetdelay) resetdelay = 1000;
    
    $scope.rowClass[userid] = value;

    if(resetdelay) 
      $timeout(function(){
        $scope.rowClass[userid] = '';
      }, resetdelay);
  }



  $scope.newUser = null;
  $scope.new = function(u){
    $scope.edit({});
    $scope.newUser = u;
  }

  $scope.add = function(form){
    if(form.$invalid || !$scope.newUser) return;
    // generate random password
    $scope.newUser.password = Helpers.randomString();
    // add new user
    Users.add($scope.newUser, function(user){
      $scope.status = 'success';
      //console.log("User added, trigger change password");
      $scope.newUser.id = user.id;
      //console.log($scope.newUser);
      $scope.changePassword($scope.newUser);
      $scope.loadUsers(function(){
        $scope.setRowClass(user.id);
        $scope.reloadTable();
        $scope.new(null);
      });
    }, function(r){
      $scope.status = 'error';
      $scope.setRowClass(999);
    });
  }

  $scope.regexUsername = function(){
	    return Helpers.regexUsername;
	  }

  $scope.changePassword = function(user){
    Modals.open('./templates/me/form--change-password.html', { 
      headline: 'Change Password (' + user.displayname + ')',
      editUser: user 
    });
  }

  $scope.groups = function(user){
    var modal = Modals.open('./templates/users/form--groups-to-user.html', { 
      headline: 'Manage Groups (' + user.displayname + ')',
      editUser: user 
    });
    modal.result.then(function(result){
      if(result === 'saved'){
        $timeout(function(){
          $scope.setRowClass(user.id,'success');
        }, 500);
      }
    });
  }

  $scope.delete = function(user){
    var modal = Modals.open('./templates/users/form--delete-user.html', { 
      headline: 'Delete User (' + user.displayname + ')',
      editUser: user 
    });
    modal.result.then(function(result){
      if(result === 'delete'){
        $timeout(function(){
          $scope.setRowClass(user.id,'error');
          $timeout(function(){
            $scope.loadUsers(function(){
              $scope.reloadTable();
            });
          }, 500);
        }, 500);
      }
    });
  }
  $scope.whoami = function() {
	  return UserService.id;
  }
}]);




opiaControllers.controller('Users__DeleteUserCtrl', ['$scope','_',function($scope,_){
  $scope.editUser = _.isObject($scope.modalParams) ? $scope.modalParams.editUser : {};

  $scope.submit = function(){
    $scope.editUser.$delete(function(){ 
      $scope.$modalInstance.close('delete');
    });
  }

}]);





opiaControllers.controller('Users__GroupsToUserCtrl', ['$scope','GroupAPI','ngTableParams','$filter','OPI','$timeout','Helpers','UserService','_',function($scope,Groups,ngTableParams,$filter,opi,$timeout,Helpers,UserService,_){
  $scope.editUser = $scope.modalParams.editUser;

  $scope.disable_Edit = function(user,group) {
	  return (user.username == UserService.id) && (group.name == 'admin');
  };
  $scope.loadGroups  = function(callback){
    $scope.groups = Groups.query(function(){
      // load each group with its Users
      _.each($scope.groups, function(group){
        group['users'] = Groups.getUsers({groupname:group.name}, function(users){
          // check if user exists in userlist 
          group['includeUser'] = _.isObject( _.findWhere(users, {id: $scope.editUser.id} ) );
        });
      });
      // make the callback, if any
      if(_.isFunction(callback)) callback();
    });
  }
  $scope.loadGroups();


  $scope.submit = function(form){
    var saveQueue = [];

    // loop through groups 
    _.each($scope.groups, function(group){
      saveQueue.push( 
                     group.includeUser ? 
                     Groups.addUser( {groupname:group.name}, {user:$scope.editUser.username} )
                     :
                     Groups.deleteUser( {groupname:group.name, username:$scope.editUser.username} )
                    );
    });

    var checkQueue = function(){
      if(_.where(saveQueue, {'$resolved': false}).length <= 0){
        // done!
        $scope.$modalInstance.close('saved');

      } else {
        // still saving, check again later
        $timeout(checkQueue, 200);
      }
    };
    checkQueue();

  }

}]);
