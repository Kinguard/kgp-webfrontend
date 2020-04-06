
opiaServices.factory('SessionAPI', ['OPI','$resource',function(opi,$resource){
  return $resource(
                  opi.apiUrl+'session', 
                  {  },
                  {
                    loggedin: { method: 'GET' },
                    login:    { method: 'POST' },
                    logout:   { method: 'DELETE' }
                  }
  );
}]);


opiaServices.factory('UserAPI', ['OPI','$resource',function(opi,$resource){
  return $resource(
                  opi.apiUrl+'users/:id/:action', 
                  { id:'@id', action: '@action'},
                  {
                    'add': { method: 'POST' },
                    'save': { method: 'PUT' },
                    'changePassword': { 
                      method: 'POST', 
                      params: { action:'changepassword' } 
                    },
                    'groups': {
                    	method: 'GET', isArray : true,
                    	params: { action: 'groups'}
                    }
                  }
  );
}]);
opiaServices.factory('GroupAPI', ['OPI','$resource',function(opi,$resource){
  return $resource(
                  opi.apiUrl+'groups/:groupname:groupid/:username:userid', 
                  { groupname:'@groupname', groupid:'@groupid', username: '@username', userid: '@userid'},
                  {
                    'add': { method: 'POST' },
                    'save': { method: 'PUT' },
                    'getUsers': { method: 'GET', isArray: true },
                    'addUser': { method: 'POST' },
                    'deleteUser': { method: 'DELETE' },
                    
                    
                  }
  );
}]);

opiaServices.factory('MailAPI', ['OPI','$resource',function(opi,$resource){
  return $resource(
                  opi.apiUrl+'smtp/:param1/:domain/:param2/:emailaddress/:userfilter', 
                  { param1:'@param1',domain:'@domain',param2:'@param2',emailaddress:'@emailaddress' },
                  { 
                    // SMTP Settings
                    'getSmtpSettings': { method: 'GET', params: { param1:'settings' } },
                    'setSmtpSettings': { method: 'POST', params: { param1:'settings' } },

                    // Receive Mail
                    'getReceiverDomains': { method: 'GET', params: { param1:'domains' }, isArray: true },
                    'addReceiverDomain': { method: 'POST', params: { param1:'domains' } },
                    'deleteReceiverDomain': { method: 'DELETE', params: { param1:'domains', domain:'@domain' } },
                    'deleteReceiverDomains': { method: 'DELETE', params: { param1:'domains' } },
                    'getReceivers': { method: 'GET', params: { param1:'domains',domain:'@domain',param2:'addresses',userfilter: '@userfilter' }, isArray: true },
                    'addReceiver': { method: 'POST', params: { param1:'domains',domain:'@domain',param2:'addresses' } },
                    'deleteReceiver': { method: 'DELETE', params: { param1:'domains',domain:'@domain',param2:'addresses',emailaddress:'@emailaddress' } }
                  }
  );
}]);
opiaServices.factory('ExternalMailAPI', ['OPI','$resource',function(opi,$resource){
  return $resource(
                  opi.apiUrl+'fetchmail/accounts/:id', 
                  { id:'@id' },
                  { 
                    'update': { method: 'PUT' }
                  }
  );
}]);

opiaServices.factory('NetworkAPI', ['OPI','$resource',function(opi,$resource){
  return $resource(
                  opi.apiUrl+'network/:param1/:param2/:param3', 
                  { param1:'@param1',param2:'@param2',param3:'@param3' },
                  { 
                    'getSettings': { method: 'GET', params: { param1:'settings' } },
                    'setSettings': { method: 'POST', params: { param1:'settings' } },
                    'getPort': { method: 'GET', params: { param1:'ports' } },
                    'setPort': { method: 'PUT', params: { param1:'ports' } },
                    'getOpiName': { method: 'GET', params: { param1:'opiname' } },
                    'setOpiName': { method: 'POST', params: { param1:'opiname' } },
                    'getDomains': { method: 'GET', params: { param1:'domains' } },
                    'getCertConfig': { method: 'GET', params: { param1:'CertSettings'} },
                    'setCertConfig': { method: 'POST', params: { param1:'CertSettings'} },
                    'getShellAccess': { method: 'GET', params: { param1:'opiname' } },
                    'setShellAccess': { method: 'POST', params: { param1:'opiname' } },
                    'checkFqdn' : { method: 'POST' , params: {param1:'checkopiname'} }
                  }
  );
}]);



opiaServices.factory('BackupAPI', ['OPI','$resource',function(opi,$resource){
  return $resource(
                  opi.apiUrl+'backup/:param1/:param2', 
                  { param1:'@param1', param2: '@param2' },
                  {
                    'getSettings': { method: 'GET', params: { param1:'settings' } },
                    'setSettings': { method: 'POST', params: { param1:'settings' } },
                    'getQuota': { method: 'GET', params: { param1:'quota' } },
                    'getStatus': { method: 'GET', params: { param1:'status' } },

                    'startBackup': { method: 'POST', params: { param1:'start' } },

                    'getSubscriptions': { method: 'GET', params: { param1:'subscriptions' }, isArray: true },
                    'addSubscription' : { method: 'POST', params: { param1:'subscriptions' } },
                    'getSubscription' : { method: 'GET', params: { param1:'subscriptions', param2: '@id' } }
                  }
  );
}]);
opiaServices.factory('SystemAPI', ['OPI','$resource',function(opi,$resource){
  return $resource(
                  opi.apiUrl+'system/:param1/:param2/', 
                  {  },
                  {
                    'getModuleProviders': { method: 'GET', params: { param1:'moduleproviders' } },
                    'getModuleProviderInfo': { method: 'GET', params: { param1:'moduleproviderinfo'} },
                    'updateModuleProviders': { method: 'POST', params: { param1:'moduleproviders' } },
                    'getType': { method: 'GET', params: { param1:'type' } },
                    'getUnitid': { method: 'GET', params: { param1:'unitid' } },
                    'setUnitid': { method: 'POST', params: { param1:"unitid" } },
                    'getUpdateSettings': { method: 'GET', params: { param1:'updatesettings' } },
                    'setUpdateSettings': { method: 'POST', params: { param1:'updatesettings' } },
                    'getUpgrades': { method: 'GET', params: { param1: 'upgrade' } },
                    'startUpgrade': { method: 'POST', params: { param1: 'upgrade' } },
                    'startUpdate' : { method: 'POST', params: { param1: 'update' } },
                  },
                  {  }
  );
}]);

opiaServices.factory('ShellAPI', ['OPI','$resource',function(opi,$resource){
    return $resource(
                    opi.apiUrl+'shell', 
                    {  },
                    {  }
    );
}]);


opiaServices.factory('ShutdownAPI', ['OPI','$resource',function(opi,$resource){
    return $resource(
                    opi.apiUrl+'shutdown', 
                    {  },
                    {
                      'doAction' : {method : 'POST'}  
                    }
    );
  }]);

opiaServices.factory('StatusAPI', ['OPI','$resource', function(opi,$resource){
  return $resource(
                  opi.apiUrl+'status/:param1/', 
                  { param1:'@param1' },
                  {
                    'getStatus': { method: 'GET', params: { param1:'status' } },
                    'getMessages': { method: 'GET', params: { param1:'messages' } },
                    'ackMessage': { method: 'POST', params: { param1:'messages' } },
                    'getStorage': { method: 'GET', params: { param1:'storage' } },
                    'getPackages': { method: 'GET', params: { param1:'packages' } },
                 }
  );
}]);
