opiaServices.factory('Helpers', ['_',function(_){
  var helpers = {};


  // SIZESTATE: return current bootstrap size mode
  helpers.sizestate = function(size) {
    var envValues = ["xs", "sm", "md", "lg"];

    $el = angular.element('<div id="sizestate-tester" />');
    angular.element(document.getElementsByTagName('body')[0]).append($el);

    for(var i = envValues.length - 1; i >= 0; i--) {
      var envVal = envValues[i];

        $el.addClass('hidden-'+envVal);
        if (String(helpers.css($el,'display')).indexOf('none') >= 0) {
            $el.remove();
            if(helpers.isDefined(size)){
              return (size === envValues[i]);
            } else {
              return envValues[i];
            }
        }
        
    }
  }

  // CAMELCASE: Transform string to camelCase format
  helpers.camelCase = function(str){
    return str.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
  }

  // ISDEFINED: quicky inverse of _.isUndefined
  helpers.isDefined = function(o){
    return !_.isUndefined(o);
  }

  // CSS: Customized $element.css() to retrieve computed values
  helpers.css = function($element, name, value){
    $element = angular.element($element);
    var element = $element[0];
    name = helpers.camelCase(name);

    if (helpers.isDefined(value)) {
        element.style[name] = value;
    } else {
        var val;
        //for old IE
        if (helpers.isDefined(element.currentStyle)){
            val = element.currentStyle[name];
        }
        //for modern browsers
        else if (helpers.isDefined(window.getComputedStyle)){
            val = element.ownerDocument.defaultView.getComputedStyle(element,null)[name];
        }
        else {
            val = element.style[name];
        }
        return  (val === '') ? undefined : val;
    }
  }

  // RANDOMSTRING: Generate random string, e.g. password
  helpers.randomString = function(length, validChars){
    length = length || 10;
    validChars = validChars || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    var rstr = "";
    for( var i=0; i < length; i++ )
        rstr += validChars.charAt(Math.floor(Math.random() * validChars.length));
      
    return rstr;
  }

  helpers.stripandLowercase = function(str) {
    return str.toLowerCase().replace(/ /g,'');
  }

  helpers.hasMember = function(obj, parts) {
    //var parts = prop.split('.');
    for(var i = 0, l = parts.length; i < l; i++) {
        var part = parts[i];
        if(obj !== null && typeof obj === "object" && part in obj) {
            obj = obj[part];
        }
        else {
            return false;
        }
    }
    return true;
}


  // Regular Expressions
  // If the expression evaluates to a string, then it will be converted to a RegExp after wrapping it in ^ and $ characters.
  // https://docs.angularjs.org/api/ng/directive/ngPattern

  helpers.regexIP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  helpers.regexEmail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
  helpers.regexUsername = /^[a-z]+$/;
  helpers.regexOpiname = /^[a-z0-9-]+$/;
  helpers.regexFQDN = /^(?=.{1,254}$)((?=[a-z0-9-]{1,63}\.)?[a-z0-9]+(-[a-z0-9-]+)*\.)+[a-z]{2,63}$/;
  helpers.regexAWSKey = /^[A-Za-z0-9]{20}$/;
  helpers.regexAWSSecKey = /^[\/\+A-Za-z0-9]{40}$/;  
  helpers.regexIPorFQDN = /(^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$)|(^(?=.{1,254}$)((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)*[a-z]{2,63}$)/;
  // http://docs.aws.amazon.com/AmazonS3/latest/dev/BucketRestrictions.html
  helpers.regexAWSbucket = /^[a-z0-9]([\-a-z0-9]*[a-z0-9])*(\.?[a-z0-9]([\-a-z0-9]*[a-z0-9])*)*$/;  
  
  return helpers;
}]);


  