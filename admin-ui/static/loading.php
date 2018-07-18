<?php
define("CONFIGWRAPPER","/usr/share/kinguard-utils/sysconfigWrapper.php");
if (is_file(CONFIGWRAPPER))	include CONFIGWRAPPER;	
$theme = function_exists("getConfigValue") && getConfigValue("webapps","theme") ? getConfigValue("webapps","theme") : "kgp";

?>

<html>
<head>
<link rel="stylesheet" type="text/css" href="themes/<?=$theme?>/css/loading.css">
</head>
<body>
<div id="loading">
	<img src="themes/<?=$theme?>/img/loading.gif" />
</div>

</body>

</html>
