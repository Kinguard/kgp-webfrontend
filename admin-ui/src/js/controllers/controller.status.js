opiaControllers.controller('StatusCtrl', ['$scope','BackupAPI','StatusAPI','$filter','Helpers','ModalService',function($scope,Backup,Status,$filter,Helpers,Modals){

  $scope.MaxMsgLength = 25;
  $scope.showpkgs = false;



  function getMessage(id) {
    retval = false;
    angular.forEach($scope.messages, function(value,key){
      if (value.id == id) {
        retval = value;
      }
    });
    return retval;

  }
  function remove_id(id){
    angular.forEach($scope.messages, function(value,key){
      if (value.id == id) {
        $scope.messages.splice(key,1);
      }
    });
  }

  $scope.loadBackupStatus = function(callback){
    $scope.backupStatus = Backup.getStatus(function(){
      if(String($scope.backupStatus.date).length <= 10) $scope.backupStatus.date *= 1000;
      if(! $scope.backupStatus.info) $scope.backupStatus.info = ""; 
      if(_.isFunction(callback)) callback();
    });
  }
  
  $scope.loadMessages = function(callback) {
    //console.log("Loading messages");
    $scope.messages = Status.getMessages(
      function(value){
        //console.log("Messages loaded.");
      },
      function(response) {
        console.log("Loading failed");
        console.log(response);
      }
    );

  }

  $scope.viewMessage = function(msg_id){
    msg = getMessage(msg_id);
    
    var modal = Modals.open('./templates/home/msg-detail.html', { 
      headline: 'Current Message Details',
      msg : msg
    });
    modal.result.then(function(result){ 
      if(result === 'success'){
        // reload  message list
        $scopel.loadMessages();
      }
    });
  }

  $scope.ack = function(id) {
    // run function to ack on server, then remove it from the list in UI. 
    Status.ackMessage(
      {'id' : id},
      function(value){
        //console.log("Ack success");
        remove_id(value.deleted);
      },
      function(response){
        console.log("Ack failed");
        console.log(response)
      });
  }
  $scope.loadStatus = function() {
    Status.getStatus(
      function(value)
      {
        $scope.temperature = value['temperature'];
        $scope.uptime = value['uptime'];
      },
      function(resp)
      {
        console.log("Status load failed");
        console.log(resp);
      });
  }
  $scope.loadStorage = function() {
    $scope.storage = Status.getStorage(
      function(value)
      {
        $scope.storage.value = 100 * ($scope.storage.used / $scope.storage.total);      
      },
      function(resp)
      {
        console.log("Storage load failed");
        console.log(resp);
      });
  }

  $scope.loadPackages = function() {
    $scope.packages = Status.getPackages(
      function(value)
      {
        //console.log("Package list loaded");
      },
      function(resp)
      {
        console.log("Package list load failed");
        console.log(resp);
      });
  }


  $scope.loadMessages();
  $scope.loadBackupStatus();
  $scope.loadStatus();
  $scope.loadStorage();
  $scope.loadPackages();

}]);




opiaControllers.controller('Status__MsgDetailCtrl',['$scope','_','StatusAPI','$timeout',function($scope,_,Status,$timeout){
  $scope.msg = _.isObject($scope.modalParams) ? $scope.modalParams.msg : {};

  $scope.submit = function(){ 
    if (Status.ackMessage($scope.msg.id)){
      $scope.status = 'success';
      $timeout(
          function() {
            $scope.$modalInstance.close('success');
          },
      500);
    } else {
      $scope.status = 'error';
      $scope.$modalInstance.close('error');
    }

  }

}]);