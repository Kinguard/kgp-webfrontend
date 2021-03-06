<!DOCTYPE html>
<?php

include "helpers.php";

?>

<html lang="en-US">
<head>

<title>Really Important Stuff Inside</title>
<meta charset="utf-8">
<link rel="stylesheet" type="text/css" href="themes/kgp/css/frames.css">
<link rel="stylesheet" type="text/css" href="themes/kgp/css/popbox.css">
<?php
	if(checkCustomThemeFile("css/frames.css")) {
		print "<link rel='stylesheet' type='text/css' href='".createThemepath("css/frames.css")."'>\n";
	}
	if(checkCustomThemeFile("css/popbox.css")) {
		print "<link rel='stylesheet' type='text/css' href='".createThemepath("/css/popbox.css")."'>\n";	
}
?>

<link rel="shortcut icon" href="<?=createThemepath("")?>favicon.png" />
<script src="js/jquery.min.js"></script>
<script src="js/popbox.min.js"></script>
<script src="js/texts.js"></script>
<script src="js/jquery.cookie.js"></script>
<script src="opiframes.js"></script>

<meta http-equiv="cache-control" content="max-age=0" />
<meta http-equiv="cache-control" content="no-cache" />
<meta http-equiv="expires" content="0" />
<meta http-equiv="expires" content="Sat, 01 Mar 1975 1:00:00 GMT" />
<meta http-equiv="pragma" content="no-cache" />

</head>

<body id="op_wrapper">
<div id="op_nav">

</div>

<div id="confirm_logout_backdrop" class="hidden"></div>
<div id="confirm_logout" class="hidden">
	<div class="logout_modal">
		<header>
			<h1 class="modal_header">Please confirm logout</h1>
			<a class="close-modal" onclick="logout_cancel()">
			<img src="<?=createThemepath("img/icons/close.png")?>" />
				
			</a>
		</header>
		<div class="content">
			<p>
				<!-- logout fuction is bound when showing modal  -->
				<button onclick="logout_cancel()" id="btn_logout_cancel" class="btn btn-default">Cancel</button>
				<button id="btn_logout_confirm" class="btn btn-primary">Log out</button>
			</p>
		</div>
	</div>
</div>
<div id="top_header">
	<span class="hidden" id="label_curr_user">Logged in as: </span><span id="current_user">Not logged in</span>
	<div class='popbox' id="opi-apps">
	  <a class='open' href='#'>
	  	<img src="<?=createThemepath("img/opi-apps.png")?>" /></a>
	  <div class='collapse'>
		<!--  Content of box goes here -->
	    <div class='box' id="app-box">
	      <div class='arrow'></div>
	      <div class='arrow-border'></div>
	      <a href="#" class="close"><img id="nav-box-close" src="<?=createThemepath("img/close.png")?>" /></a>
			<div id="op_nav">
			<button id="button_mail" class="nav_button close" target="frame_mail">
				<div class="nav_control nav-icon" id="nav_mail"> </div>
				<div class="nav_text" id="txt_nav_mail">Mail</div>
			</button>
			<button id="button_nc_files" class="nav_button close" target="frame_nc" data-app="files">
				<div class="nav_control nav-icon" id="nav_files"> </div>
				<div class="nav_text" id="txt_nav_files">Files</div>
			</button>
			<button id="button_nc_cal" class="nav_button close" target="frame_nc" data-app="calendar">
				<div class="nav_control nav-icon" id="nav_cal"> </div>
				<div class="nav_text" id="txt_nav_cal">Calendar</div>
			</button>
			<button id="button_nc_contacts" class="nav_button close" target="frame_nc" data-app="contacts">
				<div class="nav_control nav-icon" id="nav_contacts"> </div>
				<div class="nav_text" id="txt_nav_contacts">Contacts</div>
			</button>
			<button id="button_nc_gallery" class="nav_button close" target="frame_nc" data-app="gallery">
				<div class="nav_control nav-icon" id="nav_gallery"> </div>
				<div class="nav_text" id="txt_nav_gallery">Image<br>Gallery</div>
			</button>
			<button id="button_nc_tasks" class="nav_button close" target="frame_nc" data-app="tasks">
				<div class="nav_control nav-icon" id="nav_tasks"> </div>
				<div class="nav_text" id="txt_nav_tasks">Tasks</div>
			</button>
			<button id="button_admin" class="nav_button close" target="frame_admin">
				<div class="nav_control nav-icon" id="nav_admin"> </div>
				<div class="nav_text" id="txt_nav_admin">Admin</div>
			</button>
		</div>
	    </div>
	  </div>
	</div>
	<div id="top-nav-logout">
		<a href="#" class="top-nav" alt="Logout"><img src="<?=createThemepath("/img/logout_grey.png")?>" /></a>
	</div>
</div>


<div id="content">
	<iframe class="subpage z2 z0" id="frame_admin" src = "admin.php"></iframe>
	<iframe class="subpage z1" id="frame_loading" src = "loading.php"></iframe>
	<iframe class="subpage z3" id="frame_mail" src = "loading.php"></iframe>
	<iframe class="subpage z4" id="frame_nc" src = "loading.php" allowfullscreen></iframe>
</div>
</body>


</html>
