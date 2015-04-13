opiaControllers.controller('Mail__ExternalMailboxListCtrl', ['$scope','UserAPI','MailAPI','ExternalMailAPI','ngTableParams','$filter','OPI','$timeout','Helpers','ModalService','UserService',function($scope,Users,Mail,ExternalMail,ngTableParams,$filter,opi,$timeout,Helpers,Modals,CurrUser){
  $scope.regexEmail = Helpers.regexEmail;

  $scope.mailboxes = [];

  // first load users
  $scope.users = Users.query(function(){
    $scope.users = $filter('orderBy')($scope.users, ['displayname']);
    $scope.users = $filter('userlist')($scope.users,CurrUser);
  });


  $scope.loadMailboxes = function(callback){
    $scope.mailboxes = ExternalMail.query(callback);
  }
  $scope.loadMailboxes(function(){
    $scope.mailboxes = $filter('orderBy')($scope.mailboxes, 'username');
    $scope.setTableParams();
  });

  $scope.setTableParams = function(){
    $scope.tableParams = new ngTableParams({
      total: 1,
      count: $scope.mailboxes.length
    }, {
      //groupBy: 'username',
      counts: [],
      total: $scope.mailboxes.length, 
      getData: function($defer, params){ 
        // Sort by params.sorting()
        if(params.sorting()){ 
          $scope.mailboxes = $filter('orderBy')($scope.mailboxes, params.orderBy());
        }
        // output data list
        $defer.resolve($scope.mailboxes.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
    });
  }
  $scope.reloadTable = function(){
    //$scope.tableParams.settings().groupBy = $scope.groupBy;
    $scope.tableParams.count($scope.mailboxes.length);
    $scope.tableParams.reload();
  }



  $scope.submit = function(form){
    if($scope.newMailbox)
      return $scope.add(form);
  }

  
  $scope.rowClass = [];
  $scope.setRowClass = function(mailboxid, value, resetdelay){
    if(!mailboxid)     mailboxid     = $scope.editMailbox.id;
    if(!value)      value      = $scope.status;
    if(!resetdelay) resetdelay = 1000;
    
    $scope.rowClass[mailboxid] = value;

    if(resetdelay) 
      $timeout(function(){
        $scope.rowClass[mailboxid] = '';
      }, resetdelay);
  }



  $scope.newMailbox = null;
  $scope.new = function(r){
    $scope.newMailbox = r;
  }

  $scope.add = function(form){
    if(form.$invalid || !$scope.newMailbox) return;

    var modal = Modals.open('./templates/mail/form--handle-external-mailbox.html', { 
      headline: 'Add External Mailbox',
      editMailbox: $scope.newMailbox 
    });
    modal.result.then(function(addedMailbox){
      //console.log(addedMailbox);
      if(_.isObject(addedMailbox)){
        $timeout(function(){
          $scope.setRowClass(addedMailbox.id,'success');
          $timeout(function(){
            $scope.loadMailboxes(function(){
              $scope.reloadTable();
              $scope.new(null);
            });
          }, 500);
        }, 500);
      }
    });
  }


  $scope.edit = function(mailbox){ 
    $scope.require_pwd = false;
    var modal = Modals.open('./templates/mail/form--handle-external-mailbox.html', { 
      headline: 'Edit Mailbox (' + mailbox.email + ')',
      editMailbox: mailbox,
    });
    modal.result.then(function(updatedMailbox){ 
      if(_.isObject(updatedMailbox)){
        $timeout(function(){
          $scope.setRowClass(updatedMailbox.id,'success');
          $timeout(function(){
            $scope.loadMailboxes(function(){
              $scope.reloadTable();
            });
          }, 500);
        }, 500);
      }
    });
  }


  $scope.delete = function(mailbox){ 
    var modal = Modals.open('./templates/mail/form--delete-external-mailbox.html', { 
      headline: 'Delete External Mailbox',
      editMailbox: mailbox 
    });
    modal.result.then(function(result){ 
      if(result === 'delete'){
        $timeout(function(){
          $scope.setRowClass(mailbox.id,'error');
          $timeout(function(){
            $scope.loadMailboxes(function(){
              $scope.reloadTable();
            });
          }, 500);
        }, 500);
      }
    });
  }

}]);


opiaControllers.controller('Mail__HandleExternalMailboxCtrl', ['$scope','_','$filter','UserAPI','ExternalMailAPI','MailboxSettings','$timeout','UserService',function($scope,_,$filter,Users,ExternalMail,MailboxSettings,$timeout,CurrUser){
  $scope.editMailbox = _.isObject($scope.modalParams) ? $scope.modalParams.editMailbox : {};
  $scope.users = Users.query();
  $scope.users = $filter('userlist')($scope.users,CurrUser);
  

  $scope.isEditing = function(){
	if($scope.editMailbox.id !== undefined) return true;
	return false;
  }

  $scope.validMailbox = function(mailbox){
	    if(!_.isObject(mailbox)) mailbox = $scope.editMailbox; 
	    return !!mailbox.host && !!mailbox.identity;
	  }

  $scope.lookedForDetails = false;
  $scope.require_pwd = true;

  $scope.needDetails = function(){
	    return $scope.isEditing() || $scope.lookedForDetails;
	  }

  $scope.requirePwd = function() {
	  $scope.needDetails && $scope.require_pwd;
  }
 
 
  // Look for mailbox account settings
  var newmailbox = MailboxSettings.getByMailboxObject($scope.editMailbox, true, true); // true1 = use default if not found, true2 = merge objects
  $scope.lookedForDetails = !$scope.validMailbox(newmailbox);

  if($scope.lookedForDetails) {
    $timeout(function(){ $scope.status = ''; }, 50);
  }
 
  $scope.submit = function(form){
    if(form.$invalid) return;

    var func_onSuccess = function(result){ 
      $scope.status = 'success';
      $scope.$modalInstance.close(result);
    };
    var func_onError = function(result){
     if(result.status == 409) {
    	 $scope.status="conflict";
     } else {
    	 $scope.status = 'error';
     }
    };
    $scope.editMailbox.encrypt = $scope.editMailbox.encrypt>0 ? '1' : '0';
    if($scope.isEditing()){
      // update 
      ExternalMail.update({id:$scope.editMailbox.id}, $scope.editMailbox, func_onSuccess, func_onError);

    } else {
      // add new
      ExternalMail.save($scope.editMailbox, func_onSuccess, func_onError);
    }
    
  }

}]);

opiaControllers.controller('Mail__DeleteExternalMailboxCtrl', ['$scope','_','MailAPI',function($scope,_,Mail){
  $scope.editMailbox = _.isObject($scope.modalParams) ? $scope.modalParams.editMailbox : {};

  $scope.submit = function(){ 
    $scope.editMailbox.$delete(function(){ 
      $scope.status = 'success';
      $scope.$modalInstance.close('delete');
    }, function(){
      $scope.status = 'error';
    });
    
  }

}]);
