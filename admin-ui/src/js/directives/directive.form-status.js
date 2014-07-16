opiaDirectives.directive('formStatus', ['$timeout',function($timeout){
  return {
    restrict: 'EA',
    require: 'form',
    scope: {
      status: '=formStatus'
    },
    link: function ($scope, $element, $attrs, $form) {
      //$form.status = $scope.status;

      $scope.$watch('status',function(newval){
        $form.status = $scope.status;
      });

      $scope.setStatus = function(newstatus){
        $scope.status = newstatus
        $scope.$apply();
      }
      $scope.swapStatus = function(newstatus,clearValue,delay){
        if(clearValue !== undefined){
          $scope.status = clearValue;
          $scope.$apply();
        }

        if(delay){ 
          $timeout(function(){
            $scope.setStatus(newstatus);
          }, delay);
        } else { 
          $scope.setStatus(newstatus);
        }
      }

      
      $element.attr('novalidate','novalidate');

      $element.on('submit', function(){
        var newstatus = ($form.$valid) ? 'submitting' : 'invalid';
        $scope.swapStatus(newstatus, '');
      });
      
    }
  }

}]);


opiaDirectives.directive('formStatusMessage', ['$compile',function($compile){
  return {
    restrict: 'EA',
    require: '^form',
    transclude: true,
    replace: true,
    scope: {
      messageType: '@formStatusMessage'
    },
    template: '<div ng-show="form.status == messageType" ng-transclude></div>',
    link: function ($scope, $element, $attrs, $form) {
      $scope.form = $form;
    }
  }
}]);

