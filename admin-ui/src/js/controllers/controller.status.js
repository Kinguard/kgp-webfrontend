opiaControllers.controller('StatusCtrl', ['$scope','BackupAPI','StatusAPI','SystemAPI','$filter','$interval','Helpers','ModalService',function($scope,Backup,Status,System,$filter,$interval,Helpers,Modals){

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
    Status.getMessages(
      function(value){
        $scope.messages = [];
        angular.forEach(value.messages, function(value,key){
          if (value && value.id) {
            this.push(value);
          } else {
            console.log("Missing id in message, skipping.");
          }
        },$scope.messages);

        $scope.sysmsg_support = true;
      },
      function(response) {
        //console.log("Loading failed");
        $scope.sysmsg_support = false;
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
        $scope.loadMessages();
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
    Status.getStorage(
      function(value)
      {
        $scope.storage = value.storage;
        $scope.storage.all = 1*$scope.storage.used + 1* $scope.storage.available;
        $scope.storage.value = 100 * ($scope.storage.used / $scope.storage.total); 
        //console.log("Value: " + $scope.storage.value);
        if ($scope.storage.value < 3) {
          // set it to 3 so that the bar shows...
          $scope.storage.value = 3;
          //console.log("Setting Value to:" + $scope.storage.value);
        }     
      },
      function(resp)
      {
        console.log("Storage load failed");
        console.log(resp);
      });
  }

  $scope.loadPackages = function() {
    Status.getPackages(
      function(value)
      {
        //console.log("Package list loaded");
        $scope.packages = value.packages;
      },
      function(resp)
      {
        console.log("Package list load failed");
        console.log(resp);
      });
  }

  $scope.getUpgrades = function() {
    System.getUpgrades(
      function(value)
      {
        $scope.upgrade = {
          available: value.available,
          description: value.description
        };
      },
      function(resp)
      {
        console.log("Get upgrades failed");
        console.log(resp);
      }
    );
  }

  $scope.startUpgrade = function() {
	System.startUpgrade();
  }

  $scope.startUpdate = function() {
	System.startUpdate();
  }

  if( $scope.user.isAdmin() ) {
    $scope.loadBackupStatus();
    $scope.getUpgrades();
  }

  $scope.loadStatus();
  $scope.loadMessages();
  $scope.loadStorage();

  //console.log("Trigger periodic updates");
  periodicStatus = $interval($scope.loadStatus,10000);
  periodicMessages = $interval($scope.loadMessages,30000);
  periodicStorage = $interval($scope.loadStorage,60000);


  $scope.loadPackages();

  System.getType(
    function(value)
    {
      $scope.osversion = value.osversion;
    },
    function(resp)
    {
      $scope.osversion = "Unavailable";
	  console.log("Failed to get type");
      console.log(resp);
    }
  );



  $scope.$on('$destroy', function() {
    //console.log("Element destroy");
    $interval.cancel(periodicStatus);
    $interval.cancel(periodicMessages);
    $interval.cancel(periodicStorage);
  });

}]);




opiaControllers.controller('Status__MsgDetailCtrl',['$scope','_','StatusAPI','$timeout',function($scope,_,Status,$timeout){
  // 'msg' is available from the ModalParameters
  $scope.msg = msg;

  $scope.submit = function(){ 
    if ( Status.ackMessage({'id' : msg.id} ) ){
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
