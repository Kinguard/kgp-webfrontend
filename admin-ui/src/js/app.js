
var opiaApp = angular.module('opiaApp', [
                           'opiaControllers',
                           'opiaServices',
                           'opiaDirectives',
                           'opiaFilters',
                           
                           'ngTable',
                           'gettext',
                           'ui.bootstrap',
                           'ui.utils',
                           'LocalStorageModule',
                           'ngRoute',
                           'ngAnimate',
                           'ngCookies',
                           'underscore'
                           ]);


opiaApp.config(['localStorageServiceProvider','$routeProvider','$httpProvider','$uibTooltipProvider', function(localStorageServiceProvider, $routeProvider, $httpProvider,$tooltipProvider){
  localStorageServiceProvider.setPrefix('opia');
  // localStorageServiceProvider.setStorageCookieDomain('example.com');
  // localStorageServiceProvider.setStorageType('sessionStorage');


  // Set post requests send Form Data instead of Request Payload
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
  $httpProvider.defaults.useXDomain = true;
  $httpProvider.defaults.withCredentials = true;
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
  $httpProvider.defaults.transformRequest.unshift(function(data, headersGetter){
    var str = [];
    angular.forEach(data, function(value,key){
      str.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    });
    return str.join("&");
  });



  $routeProvider
    .when('/', {
      templateUrl: 'templates/home/home.html'
    })
    .when('/me', {
      templateUrl: 'templates/me/me.html',
      controller: 'MeCtrl'
    })
    .when('/users/:tab?', {
      templateUrl: 'templates/users/users.html',
      controller: 'UsersCtrl'
    })
    .when('/mail/:tab?', {
      templateUrl: 'templates/mail/mail.html',
      controller: 'MailCtrl'
    })
    .when('/network/:tab?', {
      templateUrl: 'templates/network/network.html',
      controller: 'NetworkCtrl'
    })
    .when('/backup/:tab?', {
      templateUrl: 'templates/backup/backup.html',
      controller: 'BackupCtrl'
    })
    .when('/update/:tab?', {
      templateUrl: 'templates/update/update.html',
      controller: 'UpdateCtrl'
    })
    .when('/shutdown', {
      templateUrl: 'templates/shutdown/shutdown.html',
      controller: 'ShutdownCtrl'
    })
    .otherwise({
      redirectTo: '/'
    })
  ;



  $tooltipProvider.options({
    placement: 'right',
    popdownDelay: 0,
    appendToBody: true
  });


}]);


opiaApp.run(['$rootScope','UserService','ModalService','PreloadService','$templateCache','$location','_','Helpers','UserAPI','$interval',function($rootScope,User,Modals,Preload,$templateCache,$location,_,Helpers,Users,$interval){


  User.refresh();

  $rootScope.user = User;
  $rootScope.modals = Modals;
  
  

  $rootScope.pageName = function(){ 
    if(!User.isChecked()) return 'loading';
    return User.isLogged() ? 'admin' : 'login'; 
  }
  $rootScope.page = function(){ return './templates/' + $rootScope.pageName() + '.html'; }

  $rootScope.gotoPath = function(path){
    $location.path(path);
  }

  $rootScope.sizestate = function(){
    return Helpers.sizestate();
  }
  

  $rootScope.htmlClassesArray = [ $rootScope.pageName ];
  $rootScope.htmlClasses = function(){ 
    var classes = [];
    _.each($rootScope.htmlClassesArray, function(c){
      if(_.isFunction(c)){
        classes.push(c());
      } else if(_.isObject(c)){
        _.each(c, function(value,key){
          if(value) classes.push(key);
        });
      } else {
        classes.push(c);
      }
    });
    return classes;
  }
  //$rootScope.$watch($rootScope.htmlClasses, null, true);

}]);

