opiaServices.factory('ModalService', ['$uibModal','$routeParams','_',function($modal,$routeParams,_){
  var modals = {
    login: function(resolve, params){
      return $modal.open({
        templateUrl: '/views/user/login/',
        controller: 'LoginCtrl',
        resolve: resolve
      });
    },
    createAccount: function(resolve, params){
      return $modal.open({
        templateUrl: '/views/user/createaccount/',
        controller: 'CreateAccountCtrl',
        resolve: resolve
      });
    },
    logout: function(resolve, params){
      return $modal.open({
        templateUrl: '/views/user/logout/',
        controller: 'LogoutCtrl',
        resolve: resolve
      });
    },
    addDonation: function(resolve, params){
      return $modal.open({
        templateUrl: '/views/donation/add-wizard/index/',
        controller: 'AddDonationCtrl',
        resolve: resolve,
        backdrop: 'static'
      });
    }
  }

  var openedModals = {};
 
  function open(templateUrl, params, replaceDefaults){ 
    //if(!_.isUndefined(openedModals[templateUrl])) return openedModals[templateUrl];
    closeAll();

    params = angular.extend(params, {templateUrl:templateUrl});
    var defaults = {
      templateUrl: './templates/modal.html',
      controller: 'ModalCtrl',
      resolve: {
        modalParams: function(){ return params; }
      }
    };
    if(_.isObject(replaceDefaults)) defaults = angular.extend(defaults, replaceDefaults);

    openedModals[templateUrl] = $modal.open(defaults); 
    return openedModals[templateUrl];
  }


  function open__disabled(modal, resolve){ 
    if(_.isObject(modal)) resolve = modal;
    if(!_.isFunction(modals[modal])) modal = 'modalContainer';

    if(!_.isUndefined(openedModals[modal])) return openedModals[modal];
    closeAll();
    openedModals[modal] = modals[modal](resolve);
    return openedModals[modal];
  }

  function close(modal){ 
    try {
      var c = openedModals[modal].dismiss('closed');
      delete openedModals[modal]; 
      return c;
    } catch(ex) {}
  }
  function closeAll(){
    for(var modal in openedModals){
      close(modal);
    }
  }


  
  return {
    modals: modals,
    open: open,
    close: close,
    closeAll: closeAll
  };
}]);