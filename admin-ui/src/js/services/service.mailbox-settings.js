opiaServices.factory('MailboxSettings', ['_','$filter',function(_,$filter){
  var ms = {};

  ms.settingsList = {
    'default': {
      resolve: function(mailbox){
        if(!_.isObject(mailbox)) mailbox = {};
        mailbox.identity = mailbox.identity || mailbox.email || '';
        return mailbox;
      }
    },
    'gmail.com': {
      resolve: function(mailbox){
        if(!_.isObject(mailbox)) mailbox = {};
        mailbox.host = mailbox.host || 'pop.gmail.com';
        mailbox.identity = mailbox.identity || mailbox.email || '';
        mailbox.encrypt = 1;
        return mailbox;
      }
    },
    'hotmail.com': {
      domainAliases: ['msn.com', 'live.se', 'outlook.com'],
      resolve: function(mailbox){
        if(!_.isObject(mailbox)) mailbox = {};
        mailbox.host = mailbox.host || 'pop3.live.com';
        mailbox.identity = mailbox.identity || mailbox.email || '';
        mailbox.encrypt = 1;
        return mailbox;
      }
    },
    'yahoo.com': {
      domainAliases: ['yahoo.se'],
      resolve: function(mailbox){
        if(!_.isObject(mailbox)) mailbox = {};
        mailbox.host = mailbox.host || 'pop.mail.yahoo.com';
        mailbox.identity = mailbox.identity || String(mailbox.email+'@').split('@')[0] || '';
        mailbox.encrypt = 1;
        return mailbox;
      }
    }
  };

  // add main domain to domainAliases for easier use
  _.each(ms.settingsList, function(s,key){
    if(!_.isArray(s.domainAliases)) s.domainAliases = [];
    if(_.indexOf(s.domainAliases, key) < 0) s.domainAliases.push(key.toLowerCase());
  });


  ms.getByDomain = function(domain, useDefault, mailbox){
    domain = String(domain+'').toLowerCase();
    if(!_.isObject(mailbox)) mailbox = {};

    var settings = {};
    if(useDefault) settings = ms.settingsList.default;

    _.each(ms.settingsList, function(s){
      if(_.indexOf(s.domainAliases, domain) >= 0)
        settings = s;
    });
    return settings.resolve(mailbox);
  }

  ms.getByEmail = function(email, useDefault, mailbox){
    // require angular filter 'emailDomain'
    var domain = $filter('emailDomain')(email);
    return ms.getByDomain(domain, useDefault, mailbox);
  }

  ms.getByMailboxObject = function(mailbox, useDefault, merge){
    var newmailbox = ms.getByEmail(mailbox.email, useDefault, mailbox);

    if(merge) mailbox = angular.extend(mailbox, newmailbox);
    return newmailbox;
  }

  

 
  return ms;
  
}]);