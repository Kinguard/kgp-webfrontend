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
      },
      function() {
    	  // invalidate authentication variables
          angular.extend(user, {authenticated: false, isAdmin : false});
	  	  if(window.self !== window.top) {
			  window.parent.logout(1,"/admin");
		  }
      });
    },
    login: function(args){ // args = { username, password [,success] [,error] }
      if(typeof args !== 'object') return;
      Session.login(args.login,function(data,headers){ 
        if(data){ // logged in
  		  if(window.self !== window.top) {
  	          // Call parent (frame wrapper) login function
		      window.parent.login(args.login);
		  }
          if(!args.preventUserRefresh) user.refresh();
          if(_.isFunction(args.success)) args.success(data,status);

        } else { // failed
          if(_.isFunction(args.error)) args.error(data,status);
        }
      },args.error);
    },
    logout: function(args){
      var success = (typeof args === 'function') ? args : (typeof args === 'object') ? args.success : function(){};
      Session.logout(function(data,status){
    	  success(data,status);
    	  if(window.self !== window.top) {
  	          // Call parent (frame wrapper) logout function
    		  //console.log("logout OC/RC");
    		  window.parent.logout(1,"/admin");
    	  }
      },
      function(){
    	  // make sure to invalidate authentication variables
          angular.extend(user, {authenticated: false, isAdmin : false});
      });
    },
    shutdown: function(args){
        var success = (typeof args === 'function') ? args : (typeof args === 'object') ? args.success : function(){};
    	//console.log("User service shutdown");
        Session.logout(function(data,status){
      	  success(data,status);
        });
		if(window.self !== window.top) {
	        // Call parent (frame wrapper) logout function
			//console.log("logout OC/RC");
			window.parent.logout(0); 
		}
      },
    reboot: function(args){
		var success = (typeof args === 'function') ? args : (typeof args === 'object') ? args.success : function(){};
		//console.log("User service reboot: ");
		Session.logout(function(data,status){
			success(data,status);
		});
		if(window.self !== window.top) {
			//console.log("logout OC/RC");
			window.parent.logout(args.timeout,args.url); 
		}
    }
  };

  return user;
}]);
