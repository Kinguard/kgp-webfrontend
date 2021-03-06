opiaControllers.controller('AdminCtrl', ['$scope','$rootScope','UserService','$location','$route','$window','$interval','Helpers','StatusAPI','SystemAPI',function($scope,$rootScope,User,$location,$route,$window,$interval,Helpers,Status,System){
  $route.reload();

  var $html = angular.element(document.getElementsByTagName('html'));

  getSysType = function(){
    System.getType(
      function(type){
        switch (type.typeText) {
          case ("Armada"):
            $scope.sysType="KEEP";
            break;
          default:
            $scope.sysType=type.typeText;
            break;
        }
        if(type.provider) {
          $scope.provider=type.provider;
        }
        if(type.theme) {
          $scope.sysTheme = type.theme;
        }
      },
      function(response) {
        console.log("Loading type failed");
        console.log(response);
      }

    );
  }

  $scope.sysType = "NotSet";
  $scope.sysTheme = "kgp";
  getSysType();
    
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
       if(window.self !== window.top) {
    	   $window.location = 'templates/logout.html';
       } else {
    	   top.location.href = "admin.html";
       }
    });
  }

  $scope.menu = function(){
    //console.log('menu');
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
  
  if(window.self !== window.top) {
	  if (User.isLogged()) {
	      window.parent.set_name(User.username);
	      window.parent.load_nextframe();
	  }
  }

  
  // watch user's timeout
  $rootScope.checkForTimeout = function(){ 
    User.refresh();
    if(!User.isLogged()) $scope.logout();
  }
  $rootScope.$on('$routeChangeSuccess', $rootScope.checkForTimeout);
  $interval($rootScope.checkForTimeout, 30000);


}]);
