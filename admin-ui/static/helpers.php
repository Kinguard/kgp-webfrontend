<?php
define("CONFIGWRAPPER","/usr/share/kinguard-utils/sysconfigWrapper.php");
if (is_file(CONFIGWRAPPER)) include CONFIGWRAPPER;  
$theme = function_exists("getConfigValue") && getConfigValue("webapps","theme") ? getConfigValue("webapps","theme") : "kgp";


function checkCustomThemeFile($path) {
	// Check if a file exists in the selected theme
	global $theme;
	return ( ($theme != "kgp") && file_exists(__DIR__."/themes/$theme/$path"));
}

function createThemepath($path,$returndefault = true) {
	global $theme;
	if($theme && file_exists(__DIR__."/themes/$theme/$path")) {
		return "themes/$theme/$path";
	} else {
		if ($returndefault) {
			return "themes/kgp/$path";			
		}
	}
}

