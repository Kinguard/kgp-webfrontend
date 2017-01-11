opiaControllers.controller('ModalCtrl', ['$scope','$uibModalInstance','modalParams',function($scope,$modalInstance,modalParams){
  $scope.modalParams = modalParams || {};
  $scope.$modalInstance = $modalInstance;
  $scope.isModal = true;

  $scope.template = function(){
    return modalParams.templateUrl;
  }
  

}]);