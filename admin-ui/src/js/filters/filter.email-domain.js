opiaFilters.filter('emailDomain', function() {
  return function(email) {
    if(!email) return '';
    var parts = String('@'+email).split('@');
    return parts[parts.length - 1];
  }
});