opiaControllers.controller('BackupCtrl', ['$scope','BackupAPI','$filter','_','ModalService',function($scope,Backup,$filter,_,Modals){
  // settings
  $scope.loadSettings = function(callback){
    $scope.settings = Backup.getSettings(function(){ 
      $scope.settings.enabled = $filter('bool')($scope.settings.enabled); 
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
      $scope.quota.percent = Math.round($scope.quota.used / $scope.quota.total * 100);
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
