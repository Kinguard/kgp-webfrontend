opiaServices.factory('PreloadService', ['$templateCache','$http',function($templateCache,$http){
  function preloadByUrl(url){
    $http.get(url).success(function(content) {
      $templateCache.put(url, content);
    });
  }
  function preloadByArray (urls){
    if(typeof urls !== 'object') return preloadByUrl(urls);
    for(var i=0; i<urls.length; i++){
      preloadByUrl(urls[i]);
    }
  }
  function preload(args){
    if(typeof args === 'object'){
      return preloadByArray(args);
    } else if(typeof args === 'string'){
      return preloadByUrl(args);
    }
  }
  return {
    preloadByUrl: preloadByUrl,
    preloadByArray: preloadByArray,
    preload: preload
  }
}]);