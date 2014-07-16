opiaDirectives.directive('validationIcon', ['$compile',function($compile){
  return {
    restrict: 'A',
    require: ['ngModel','^form'],
    scope: {
      errMsg: '=validationIcon'
    },
    link: function ($scope, $element, $attrs, $ctrls) {
      $scope.control = $ctrls[0]; 
      $scope.form = $ctrls[1]; 

      $scope.validate = function(){
        if($scope.showError() || $scope.showOK())
          $element.addClass('has-icon');
        else
          $element.removeClass('has-icon');
      }
      $scope.showError = function(){
        return ($scope.control.$dirty && $scope.control.$invalid);
      }
      $scope.showOK = function(){
        return ($scope.control.$dirty && $scope.control.$valid);
      }


      // Insert icon markup
      var icons = '' +
      '<i class="icon-err" ng-show="showError()" popover-trigger="mouseenter" popover-placement="left" popover="'+$scope.errMsg+'"></i>' + 
      '<i class="icon-ok" ng-show="showOK()"></i>'
      ; 
      var $icons = angular.element(icons);
      $element.after($icons);
      $compile($icons)($scope);
            

      $scope.$watch('control.$dirty', $scope.validate);
      $scope.$watch('control.$valid', $scope.validate);
    }
  }

}]);