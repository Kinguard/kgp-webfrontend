opiaControllers.controller('StatusCtrl', ['$scope','BackupAPI','StatusAPI','$filter','Helpers','ModalService',function($scope,Backup,Status,$filter,Helpers,Modals){

  function getMessage(id) {
    console.log("Get message: "+ id);
    retval = false;
    angular.forEach($scope.messages, function(value,key){
      console.log("Checking message id: " + value.id);
      if (value.id == id) {
        retval = value;
      }
    });
    console.log("Returning id: " + retval.id);
    console.log(retval);
    return retval;

  }
  function remove_id(id){
    angular.forEach($scope.messages, function(value,key){
      if (value.id == id) {
        console.log("Remove id: " + id);
        $scope.messages.splice(key,1);
      }
    });
    console.log("New massage array:");
    console.log($scope.messages);
  }

  $scope.loadBackupStatus = function(callback){
    $scope.backupStatus = Backup.getStatus(function(){
      if(String($scope.backupStatus.date).length <= 10) $scope.backupStatus.date *= 1000;
      if(! $scope.backupStatus.info) $scope.backupStatus.info = ""; 
      if(_.isFunction(callback)) callback();
    });
  }
  $scope.loadBackupStatus();

  $scope.ack = function(id) {
    console.log("Ack id: "+id);
    // run function to ack on server, then remove it from the list in UI. 
    remove_id(id);
  }
  $scope.MaxMsgLength = 25;
  $scope.packages = {'opi': '1.4.5','opi-control':'1.9.2','owncloud':'6.0.2','opi-webfrontend':'1.3'} ;
  $scope.storage = {};
/*  $scope.messages = [
                      {'type':'error','date':'1490340965000','message':"Test message",'id':'123'},
                      {'type':'warning','date':'1490340965','message':"Test message 2",'id':'23444'},
                      {'type':'notice','date':'1400040965000','message':"This is a long message that shoule cause a 'Read More' button to appear.",'id':'1111'}
                    ];
*/
  $scope.messages = Status.getMessages();
  $scope.temperature = "25";
  $scope.showpkgs = false;

  $scope.storage.used = 1300455660000;
  $scope.storage.total = 3*$scope.storage.used;
  $scope.storage.value = 100 * ($scope.storage.used / $scope.storage.total);
  $scope.storage.available = $scope.storage.total-$scope.storage.used;

  $scope.uptime = "67 days, 13 min";

  $scope.viewMessage = function(msg_id){
    console.log("ID: " + msg_id);
    msg = getMessage(msg_id);
    console.log("MSG:");
    console.log(msg);  
    
    var modal = Modals.open('./templates/home/msg-detail.html', { 
      headline: 'Current Message Details',
      msg : msg
    });
    modal.result.then(function(result){ 
      if(result === 'success'){
        // reload message list
        console.log("Reloading messages");
        $scope.messages = Status.getMessages();
      }
    });
  }
}]);




opiaControllers.controller('Status__MsgDetailCtrl',['$scope','_','StatusAPI',function($scope,_,Status){
  $scope.msg = _.isObject($scope.modalParams) ? $scope.modalParams.msg : {};

  $scope.submit = function(){ 
/*
    $scope.editMailbox.$delete(function(){ 
      $scope.status = 'success';
      $scope.$modalInstance.close('delete');
    }, function(){
      $scope.status = 'error';
    });
*/
    console.log("Trigger removal here");
    $scope.$modalInstance.close('success');


  }
}]);