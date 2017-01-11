opiaControllers.controller('BackupCtrl', ['$scope','BackupAPI','$filter','Helpers','_','ModalService',function($scope,Backup,$filter,Helpers,_,Modals){
  // settings
  var curr_used, curr_quota, curr_location;

  show_bar=function(location){
      console.log("Location: " + location);
      if ((location == "op" || location == "local") && ( $scope.quota.used > 0 ) ) {
        $scope.show_bar = true;
      } else {
        $scope.show_bar = false;
      }
  }

  $scope.regexAWSKey = function(){
      console.log("Trying to validate AWS key");
      return Helpers.regexAWSKey;
  }


  $scope.loadSettings = function(callback){
    $scope.settings = Backup.getSettings(function(){ 
      $scope.settings.enabled = $filter('bool')($scope.settings.enabled); 
      curr_location = $scope.settings.location;
      show_bar(curr_location);
      if(_.isFunction(callback)) callback();
    });
  }

  // status
  $scope.loadBackupStatus = function(callback){
    $scope.backupStatus = Backup.getStatus(function(){
      if(String($scope.backupStatus.date).length <= 10) $scope.backupStatus.date *= 1000;
      if(! $scope.backupStatus.info) $scope.backupStatus.info = ""; 
      if(_.isFunction(callback)) callback();
    });
  }

  // quota
  $scope.loadQuota = function(callback){
    $scope.quota = Backup.getQuota(function(){
      curr_used = $scope.quota.used;
      curr_quota = $scope.quota.total;
      $scope.quota.percent = Math.round($scope.quota.used / $scope.quota.total * 100);
      if ( $scope.quota.percent < 5) {
    	  $scope.quota.percent = 1;
      } 
      $scope.quota.status = 'success';
      if($scope.quota.percent > 50) $scope.quota.status = 'warning';
      if($scope.quota.percent > 85) $scope.quota.status = 'danger'; 
      if(_.isFunction(callback)) callback();
    });
  }

  // subscriptions
  $scope.loadSubscriptions = function(callback){
    $scope.subscriptions = Backup.getSubscriptions(callback);
  }

  $scope.loadAll = function(){
    $scope.loadSettings();
    $scope.loadBackupStatus();
    $scope.loadQuota();
    $scope.loadSubscriptions();
  }
  $scope.loadAll();



  $scope.submit = function(form){
    if(form.$invalid) return;

    Backup.setSettings($scope.settings, function(){
      $scope.status = 'success';
      $scope.loadQuota();
    }, function(){
      $scope.status = 'error';
    })
  }



  $scope.purchase = function(){
    var modal = Modals.open('./templates/backup/form--purchase.html', { 
      headline: 'Purchase Backup Storage'
    });
    modal.result.then(function(result){
      if(result === 'success'){
        $scope.loadAll();
      }
    });
  }

  $scope.changeRadio = function() {
    //$scope.loadQuota();
    if( $scope.settings.location == curr_location) {
      $scope.quota.used = curr_used;
      $scope.quota.total = curr_quota;
    } else {
      $scope.quota.used = 0;
      $scope.quota.total = 0;
    }
    show_bar($scope.settings.location);
  }
  

}]);



opiaControllers.controller('Backup__PurchaseCtrl', ['$scope','BackupAPI','$timeout',function($scope,Backup,$timeout){
  $scope.p = {};

  $scope.submit = function(form){
    if(form.$invalid) return;

    Backup.addSubscription($scope.p, function(){
      $scope.status = 'success';
      $timeout(function(){
        $scope.$modalInstance.close('success');
      }, 1000);
    }, function(){
      $scope.status = 'error';
    })
  }
}]);
