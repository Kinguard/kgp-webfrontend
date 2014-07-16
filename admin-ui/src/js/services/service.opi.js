opiaServices.factory('OPI', [function(){
  var opi = {
    apiUrl: '/admin/index.php/api/',
    ocUrl: '/oc/',
    rcUrl: '/mail/',
    userTypes: ['user','admin']
  };

  return opi;
}]);
