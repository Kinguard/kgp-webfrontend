opiaControllers.controller('BackupCtrl', ['$scope','BackupAPI','SystemAPI','$filter','Helpers','_','ModalService',function($scope,Backup,System,$filter,Helpers,_,Modals){
  // settings
  var curr_used, curr_quota;

  show_bar=function(location){
      console.log("Location: " + location);
      if ( location == "op" || location == "local" ) {
        $scope.show_bar = true;
      } else {
        $scope.show_bar = false;
      }
      console.log("Show progressbar: " + $scope.show_bar);
  }

  $scope.regexAWSKey = function(){
    return Helpers.regexAWSKey;
  }
  $scope.regexAWSSecKey = function(){
    return Helpers.regexAWSSecKey;
  }
  $scope.regexAWSbucket = function(){
    return Helpers.regexAWSbucket;
  }


  $scope.loadSettings = function(callback){
    $scope.system = System.getUnitid();
    $scope.settings = Backup.getSettings(function(){ 
      $scope.settings.enabled = $filter('bool')($scope.settings.enabled); 
      $scope.curr_location = $scope.settings.location;
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
      $scope.progbar_val = Math.round($scope.quota.used / $scope.quota.total * 100);
      if ( $scope.progbar_val < 3) {
    	  $scope.progbar_val = 3;
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

  $scope.startBackup = function(){
    Backup.startBackup(
		function(){
                $scope.status = 'started';
        }, function(){
                $scope.status = 'error';
        }
	);
  }

  $scope.loadAll = function(){
    $scope.loadSettings();
    $scope.loadBackupStatus();
    $scope.loadQuota();
    $scope.loadSubscriptions();
  }

  $scope.progbar_val = 50; // default value of progressbar
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
    if( $scope.settings.location == $scope.curr_location) {
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
