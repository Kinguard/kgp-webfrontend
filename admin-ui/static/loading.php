<?php
define("ADMINPATH",basename(__DIR__));
define("CONFIGWRAPPER","/usr/share/kinguard-utils/sysconfigWrapper.php");
if (is_file(CONFIGWRAPPER))	include CONFIGWRAPPER;	
$theme = function_exists("getConfigValue") && getConfigValue("webapps","theme") ? getConfigValue("webapps","theme") : "kgp";

?>

<html>
<head>
<link rel="stylesheet" type="text/css" href="themes/kgp/css/loading.css">	
<?php
if (file_exists(ADMINPATH."themes/<?=$theme?>/css/loading.css"))
{ ?>
<link rel="stylesheet" type="text/css" href="themes/<?=$theme?>/css/loading.css">	
<?php } ?>

</head>
<body>
<div id="loading">
<?php
if (file_exists(ADMINPATH."themes/<?=$theme?>/img/loading.gif"))
{ ?>
	<img src="themes/<?=$theme?>/img/loading.gif" />
<?php } else { ?>
	<img src="themes/kgp/img/loading.gif" />
<?php } ?>
</div>

</body>

</html>
