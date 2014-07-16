opiaControllers.controller('AdminCtrl', ['$scope','$rootScope','UserService','$location','$route','$window','$interval','Helpers',function($scope,$rootScope,User,$location,$route,$window,$interval,Helpers){
  $route.reload();

  var $html = angular.element(document.getElementsByTagName('html'));

  
  $scope.isCurrentPath = function(path){
    if($location.path().substr(0, path.length) === path){
        if(path === '/')
          return ($location.path() === '/');
      return true;
    }
    return false;
  } 

  $scope.logout = function(){
    User.logout(function(){
      console.log("Redirecting from admin controller");
      $window.location = '/templates/logout.html';
    });
  }

  $scope.menu = function(){
    console.log('menu');
    $html.toggleClass('collapsed');
  }

  $scope.tooltip = function(label){
    if(!Helpers.sizestate('lg') && !Helpers.sizestate('xs')){
      return label;
    }
  } 

  angular.element($window).on('resize', function(){
    if(Helpers.sizestate() === 'lg'){
      $html.removeClass('collapsed');
    } else {
      $html.addClass('collapsed');
    }
  }).triggerHandler('resize');
  

  console.log("Loading remaining frames");
  window.parent.set_name(User.username);
  window.parent.load_nextframe();

  
  // watch user's timeout
  $rootScope.checkForTimeout = function(){ 
    User.refresh();
    if(!User.isLogged()) $scope.logout();
  }
  $rootScope.$on('$routeChangeSuccess', $rootScope.checkForTimeout);
  $interval($rootScope.checkForTimeout, 30000);


}]);