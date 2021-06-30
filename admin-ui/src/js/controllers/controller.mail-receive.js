opiaControllers.controller('Mail__ReceiveListCtrl', ['$scope','UserAPI','MailAPI','NgTableParams','$filter','OPI','$timeout','Helpers','ModalService','UserService',"_",function($scope,Users,Mail,ngTableParams,$filter,opi,$timeout,Helpers,Modals,CurrUser,_){
  $scope.regexEmail = Helpers.regexEmail;

  $scope.receivers = [];

  // first load users
  $scope.users = Users.query(function(){
    $scope.users = $filter('orderBy')($scope.users, ['displayname']);
    $scope.users = $filter('userlist')($scope.users,CurrUser);
    // when users are loaded, load receivers and map properties
    $scope.loadReceivers(function(){ 
      // sort by domain as default
      $scope.receivers = $filter('orderBy')($scope.receivers, 'domain');
      $scope.setTableParams();
      
    });
 
  });

  $scope.loadReceivers  = function(callback){
    // loop through each domain
    $scope.domains = Mail.getReceiverDomains(function(){
      var loadQueue = [];
      var loadedReceivers = [];
      _.each($scope.domains, function(domainItem){

        // collect each domain's addresses
        var load = Mail.getReceivers({domain:domainItem.domain}, function(receivers){
        //console.log(receivers);
          // clean up (delete) un-used domains
          if(receivers.length <= 0) 
            Mail.deleteReceiverDomain({domain:domainItem.id}); 

          _.each(receivers, function(receiver){
            // add domain as property
            receiver['domain'] = domainItem.domain;
            receiver['domainItem'] = domainItem;            
            // add user as property
            receiver['userItem'] = _.findWhere($scope.users, {id:receiver.user});
            if(!angular.isUndefined(receiver['userItem']))
              receiver['userDisplayname'] = receiver['userItem'].displayname;
            
            // add to real receiver list
            loadedReceivers.push(receiver);
          });
        }); //[END]var load = Mail.getReceivers()
        loadQueue.push(load);

      });//[END]_.each($scope.domains)

      var checkLoadQueue = function(){ 
        if(_.where(loadQueue, {'$resolved':false}).length <= 0){
          // when everything's loaded - set the new list and run callback (if any)
          $scope.receivers = loadedReceivers;
          if(_.isFunction(callback)) callback();
        } else { 
          $timeout(checkLoadQueue, 100);
        }
      } 
      checkLoadQueue();
    });
  }


  $scope.groupBy = 'domain'; 

  $scope.$watch('groupBy', function(){
    if($scope.receivers.length > 0)
      $scope.tableParams.group($scope.groupBy);
  });

  $scope.setTableParams = function(){
    var retval,myrec;
    $scope.tableParams = new ngTableParams({
      total: 1,
      count: $scope.receivers.length,
      group: $scope.groupBy,
  
    }, {
      groupBy:$scope.groupBy,
      counts: [],
      total: $scope.receivers.length, 
      getData: function(params){
        // Sort by params.sorting()
        if(params.sorting()){ 
          $scope.receivers = $filter('orderBy')($scope.receivers, params.orderBy());
        }
        // output data list
        // myrec = $scope.receivers;
        // retval =$scope.receivers.slice((params.page() - 1) * params.count(), params.page() * params.count()); 
        return $scope.receivers.slice((params.page() - 1) * params.count(), params.page() * params.count()); 
        // return retval;
      }
    });
  }

  $scope.reloadTable = function(){
    //$scope.tableParams.settings().groupBy = $scope.groupBy;
    $scope.tableParams.count($scope.receivers.length);
    $scope.tableParams.reload();
  }


  $scope.submit = function(form){
    if($scope.editReceiver.id)
      return $scope.update(form);
    if($scope.newReceiver)
      return $scope.add(form);
  }


  $scope.editReceiver = {};
  $scope.edit = function(receiver, exitIfEditing){
    if(exitIfEditing && $scope.editing(receiver)) return;
    if(receiver.id) $scope.new(null);
    $scope.editReceiver = angular.copy((receiver.id !== $scope.editReceiver.id) ? receiver : {});
  }
  $scope.editing = function(receiver){
    return (receiver.id === $scope.editReceiver.id);
  }
  
  $scope.update = function(form){
    if(form.$invalid || !$scope.editReceiver.id) return;
    // save
    Receivers.save({id:$scope.editReceiver.id}, $scope.editReceiver, function(){
      $scope.status = 'success';
      $scope.loadReceivers(function(){
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
  $scope.setRowClass = function(receiverid, value, resetdelay){
    if(!receiverid)     receiverid     = $scope.editReceiver.id;
    if(!value)      value      = $scope.status;
    if(!resetdelay) resetdelay = 1000;
    
    $scope.rowClass[receiverid] = value;

    if(resetdelay) 
      $timeout(function(){
        $scope.rowClass[receiverid] = '';
      }, resetdelay);
  }



  $scope.newReceiver = null;
  $scope.new = function(r){
    $scope.edit({});
    $scope.newReceiver = r;
  }

  $scope.add = function(form){
    if(form.$invalid || !$scope.newReceiver) return;
    // add new receiver
    var domain = $filter('emailDomain')($scope.newReceiver.address);
    $scope.addDomain(domain, function(){ 
      Mail.addReceiver( {domain:domain}, $scope.newReceiver, function(receiver){
        $scope.status = 'success';
        $scope.loadReceivers(function(){
          $scope.setRowClass(receiver.id || 999);
          $scope.reloadTable();
          $scope.new(null);
        });
      }, function(r){
        $scope.status = 'error';
        $scope.setRowClass(999);
      });
    });
  }
  $scope.addDomain = function(domain, callback){ 
    Mail.addReceiverDomain({domain:''}, {domain:domain}, callback, callback);
  }



  $scope.delete = function(receiver){ 
    var modal = Modals.open('./templates/mail/form--delete-receiver.html', { 
      headline: 'Delete Receiver (' + receiver.address + ')',
      editReceiver: receiver 
    });
    modal.result.then(function(result){
      if(result === 'delete'){
        $timeout(function(){
          $scope.setRowClass(receiver.id,'error');
          $timeout(function(){
            $scope.loadReceivers(function(){
              $scope.reloadTable();
            });
          }, 500);
        }, 500);
      }
    });
  }

}]);


opiaControllers.controller('Mail__DeleteReceiverCtrl', ['$scope','_','MailAPI',function($scope,_,Mail){
  $scope.editReceiver = _.isObject($scope.modalParams) ? $scope.modalParams.editReceiver : {};
  
  $scope.submit = function(){
    Mail.deleteReceiver({ domain:$scope.editReceiver.domain, emailaddress:$scope.editReceiver.address },{}, function(){ 
      $scope.status = 'success';
      $scope.$modalInstance.close('delete');
    }, function(){
      $scope.status = 'error';
    });
    
  }

}]);
