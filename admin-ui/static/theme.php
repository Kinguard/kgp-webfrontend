<?php
define("CONFIGWRAPPER","/usr/share/kinguard-utils/sysconfigWrapper.php");
if (is_file(CONFIGWRAPPER))	include CONFIGWRAPPER;	
$theme = function_exists("getConfigValue") && getConfigValue("webapps","theme") ? getConfigValue("webapps","theme") : "";

$url=dirname($_SERVER['DOCUMENT_URI'])."/css/$theme.css";
header("Location: $url");
?>
