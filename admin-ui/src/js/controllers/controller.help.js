opiaControllers.controller('HelpCtrl', ['$scope',function($scope){

	console.log("System Provider: " + $scope.provider);
	if($scope.provider == "openproducts") {
		$scope.show_op = true;
	}
}]);
