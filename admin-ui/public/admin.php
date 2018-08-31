<?php
define("CONFIGWRAPPER","/usr/share/kinguard-utils/sysconfigWrapper.php");
if (is_file(CONFIGWRAPPER)) include CONFIGWRAPPER;  
$theme = function_exists("getConfigValue") && getConfigValue("webapps","theme") ? getConfigValue("webapps","theme") : "kgp";
?>

<!doctype html>
<html ng-app="opiaApp" class="no-js" ng-class="htmlClasses()" lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Admin</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!--  Always include kgp css file -->
    <link rel="stylesheet" href="themes/kgp/css/app.css?v=<?=uniqid()?>">
<?php
    if ($theme != "kgp") {
      printf("    <!--  Include theme specific css file -->\n");
      printf("    <link rel=\"stylesheet\" href=\"themes/%s/css/app.css?v=%s\">\n",$theme,uniqid());
    }
?>

    <!-- <link rel="stylesheet" href="css/ng-table.min.css"> -->
  <link rel="shortcut icon" href="themes/<?=$theme?>/favicon.png">
</head>
<body>
  <div id="site" ng-include="page()" class="fade"></div>


  <script src="js/opiadmin.min.js"></script>
  <script src="js/autofill-event.js"></script>
</body>
</html>
