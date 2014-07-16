opiaDirectives.directive('ngValidFunc', function() {
return {
require: 'ngModel',
scope: {
    ngValidFunc: '&'
},
link: function(scope, elm, attrs, ctrl) {
  ctrl.$parsers.unshift(function(viewValue) {
    /*if (attrs.ngValidFunc && scope[attrs.ngValidFunc] && scope[attrs.ngValidFunc](viewValue, scope, elm, attrs, ctrl)) {
      ctrl.$setValidity('custom', true);
    } else {
      ctrl.$setValidity('custom', false);
    }*/
    //console.log('ngValidFunc:');console.log(scope.ngValidFunc());
    ctrl.$setValidity('custom', scope.ngValidFunc());
    return elm.val()
  });
  }
 };
});