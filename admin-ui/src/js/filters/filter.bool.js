opiaFilters.filter('bool', function() {
  return function(value) {
    return (value === true || String(value).toLowerCase() === 'true' || value > 0);
  }
});