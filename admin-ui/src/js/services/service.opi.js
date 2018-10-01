opiaServices.factory('OPI', [function(){
  var opi = {
    apiUrl: '/admin/index.php/api/',
    l10nUrl : '/admin/templates/l10n/',
    ocUrl: '/oc/',
    rcUrl: '/mail/',
    userTypes: ['user','admin']
  };

  return opi;
}]);
