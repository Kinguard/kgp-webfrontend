opiaFilters.filter('userlist', function() {
  return function(userlist,CurrUser) {
    if(CurrUser.isAdmin()){
    	return userlist;
    } else {
    	var users = [];
    	users[0] = CurrUser;
    	return users;    	
    }
  }
});