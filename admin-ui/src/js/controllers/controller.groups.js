opiaControllers.controller('Groups__GroupListCtrl', ['$scope','GroupAPI','NgTableParams','$filter','OPI','$timeout','Helpers','ModalService','_',function($scope,Groups,ngTableParams,$filter,opi,$timeout,Helpers,Modals,_){
  $scope.loadGroups  = function(callback){
    $scope.groups = Groups.query(function(){
      // load each group with its Users
      _.each($scope.groups, function(group){
        group['users'] = Groups.getUsers({groupname:group.name});
      });
      // make the callback, if any
      if(_.isFunction(callback)) callback();
    });
  }
  $scope.loadGroups(function(){
    // sort by group name as default
    $scope.groups = $filter('orderBy')($scope.groups, 'name');
    $scope.setTableParams();
  });

  $scope.setTableParams = function(){
    $scope.tableParams = new ngTableParams({
      //sorting: { displayname: 'asc' },
      total: 1,
      count: $scope.groups.length
    }, {
      counts: [],
      total: $scope.groups.length, 
      getData: function(params){
        // Sort by params.sorting()
        if(params.sorting()){ 
          $scope.groups = $filter('orderBy')($scope.groups, params.orderBy());
        }
        // output data list
        return $scope.groups.slice((params.page() - 1) * params.count(), params.page() * params.count());
      }
    });
  }
  $scope.reloadTable = function(){
    $scope.tableParams.count($scope.groups.length);
    $scope.tableParams.reload();
  }

  $scope.usernamesInGroup = function(group){
    return _.map(group.users, function(user){ return user.name });
  }


  $scope.submit = function(form){
    if($scope.editGroup.id)
      return $scope.update(form);
    if($scope.newGroup)
      return $scope.add(form);
  }


  $scope.editGroup = {};
  $scope.edit = function(group, exitIfEditing){ 
    // disable edit functionality - map to edit users instead
    if(_.size(group) > 0) return $scope.users(group); 

    if(exitIfEditing && $scope.editing(group)) return;
    if(group.id) $scope.new(null);
    $scope.editGroup = angular.copy((group.id !== $scope.editGroup.id) ? group : {});
  }
  $scope.editing = function(group){
    return (group.id === $scope.editGroup.id);
  }
  
  $scope.update = function(form){
    if(form.$invalid || !$scope.editGroup.id) return;
    // save
    Groups.save({id:$scope.editGroup.id}, $scope.editGroup, function(){
      $scope.status = 'success';
      $scope.loadGroups(function(){
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
  $scope.setRowClass = function(groupid, value, resetdelay){
    if(!groupid)     groupid     = $scope.editGroup.id;
    if(!value)      value      = $scope.status;
    if(!resetdelay) resetdelay = 1000;
    
    $scope.rowClass[groupid] = value;

    if(resetdelay) 
      $timeout(function(){
        $scope.rowClass[groupid] = '';
      }, resetdelay);
  }



  $scope.newGroup = null;
  $scope.new = function(u){
    $scope.edit({});
    $scope.newGroup = u;
  }

  $scope.add = function(form){
    if(form.$invalid || !$scope.newGroup) return;
    // add new group
    Groups.add($scope.newGroup, function(group){
      $scope.status = 'success';
      $scope.loadGroups(function(){
        $scope.setRowClass(group.id);
        $scope.reloadTable();
        // trigger edit group
        $scope.newGroup.id = group.id;
        $scope.edit($scope.newGroup);
        $scope.new(null);
      });
    }, function(r){
      $scope.status = 'error';
      $scope.setRowClass(999);
    });
  }


  $scope.users = function(group){
    var modal = Modals.open('./templates/users/form--users-in-group.html', { 
      headline: "Manage Users in group '" + group.id + "'",
      editGroup: group 
    });
    modal.result.then(function(result){
      if(result === 'saved'){
        $timeout(function(){
          $scope.setRowClass(group.id,'success');
          $timeout(function(){
            $scope.loadGroups(function(){
              $scope.reloadTable();
            });
          }, 500);
        }, 500);
      }
    });
  }


  $scope.delete = function(group){
    var modal = Modals.open('./templates/users/form--delete-group.html', { 
      headline: 'Delete Group (' + group.name + ')',
      editGroup: group 
    });
    modal.result.then(function(result){
      if(result === 'delete'){
        $timeout(function(){
          $scope.setRowClass(group.id,'error');
          $timeout(function(){
            $scope.loadGroups(function(){
              $scope.reloadTable();
            });
          }, 500);
        }, 500);
      }
    });
  }

}]);


opiaControllers.controller('Groups__DeleteGroupCtrl', ['$scope','_',function($scope,_){
  $scope.editGroup = _.isObject($scope.modalParams) ? $scope.modalParams.editGroup : {};

  $scope.submit = function(){
    $scope.editGroup.$delete({groupid:$scope.editGroup.id}, function(){ 
      $scope.$modalInstance.close('delete');
    });
    
  }

}]);




opiaControllers.controller('Groups__UsersInGroupCtrl', ['$scope','UserAPI','GroupAPI','NgTableParams','$filter','OPI','$timeout','Helpers','UserService','_',function($scope,Users,Groups,ngTableParams,$filter,opi,$timeout,Helpers,UserService,_){
  $scope.editGroup = $scope.modalParams.editGroup;

  $scope.disable_Edit = function(user,group) {
	  return (user.username == UserService.id) && (group.name == 'admin');
  };

  $scope.loadUsers  = function(callback){
    $scope.usersInGroup = Groups.getUsers({groupid:$scope.editGroup.id}, function(){

      $scope.users = Users.query(function(){
        _.each($scope.users, function(user){
          user['inGroup'] = _.where($scope.usersInGroup, { id:user.id }).length > 0; 
        });

        // make the callback, if any
        if(_.isFunction(callback)) callback();
      });
    }); //Groups.query
  }
  $scope.loadUsers();


  $scope.submit = function(form){
    var saveQueue = [];

    // loop through groups 
    _.each($scope.users, function(user){
      saveQueue.push( 
                     user.inGroup ? 
                     Groups.addUser( {groupid:$scope.editGroup.id}, {user:user.id} )
                     :
                     Groups.deleteUser( {groupid:$scope.editGroup.id, userid:user.id} )
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
    }
    checkQueue();
  }

}]);



