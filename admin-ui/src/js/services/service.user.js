opiaServices.factory('UserService', ['SessionAPI','UserAPI','_', function(Session,Users,_){
  var user = {}
  user = {
    isChecked: function(){ return typeof user.isLogged() !== 'undefined'; },
    isLogged: function(){ return user.authenticated; },
    isAdmin: function(){ return user.admin; },
    refresh: function(){
      var args = arguments;
      Session.loggedin(function(data){
        angular.extend(user, {authenticated: data.authenticated});
        angular.extend(user, data.user);
        
        // quickfix: get all user info by another get-user-request
        if(_.isObject(data.user)){
          userid = user.id ? user.id : data.user.username;
          Users.get({id:userid}, function(u){
            angular.extend(user, u);
          });
        }

        // callback
        if(_.isObject(args) && _.isFunction(args[0])) args[0](data);
      });
    },
    login: function(args){ // args = { username, password [,success] [,error] }
      if(typeof args !== 'object') return;
      Session.login(args.login,function(data,headers){ 
        if(data){ // logged in
          if(!args.preventUserRefresh) user.refresh();
          if(_.isFunction(args.success)) args.success(data,status);
          // log into owncloud
          // console.log("Trying to log in to OwnCloud");
          window.parent.login(args.login);
        } else { // failed
          if(_.isFunction(args.error)) args.error(data,status);
        }
      },args.error);
    },
    logout: function(args){
      var success = (typeof args === 'function') ? args : (typeof args === 'object') ? args.success : function(){};
      Session.logout(function(data,status){
        success(data,status);
        window.parent.logout();
      });
    }
  };

  return user;
}]);
