<!DOCTYPE html>
<?php

include "helpers.php";

?>

<html lang="en-US">
<head>

<title>Really Important Stuff Inside</title>
<meta charset="utf-8">
<link rel="stylesheet" type="text/css" href="themes/kgp/css/frames-base.css">
<link rel="stylesheet" id="mainstyle_menutop" title="Top KGP" type="text/css" href="themes/kgp/css/frames-top.css">
<link rel="stylesheet" id="mainstyle_menuleft" title="Left KGP" type="text/css" href="themes/kgp/css/frames-left.css">
<link rel="stylesheet" id="mainstyle_menuright" title="Right KGP" type="text/css" href="themes/kgp/css/frames-right.css">
<link rel="stylesheet" id="mainstyle_menubottom" title="Bottom KGP" type="text/css" href="themes/kgp/css/frames-bottom.css">
<?php
	if(checkCustomThemeFile("css/frames.css")) {
		print "<link rel='stylesheet' type='text/css' href='".createThemepath("css/frames.css")."'>\n";
	}
?>

<link rel="shortcut icon" href="<?=createThemepath("")?>favicon.png" />
<script src="js/jquery-3.5.1.min.js"></script>

<link rel="stylesheet" type="text/css" href="css/opmenu_base.css">
<link rel="stylesheet" id="menustyle_menutop" title="Top KGP" type="text/css" href="css/opmenu_menutop.css">
<link rel="stylesheet" id="menustyle_menuleft" title="Left KGP" type="text/css" href="css/opmenu_menuleft.css">
<link rel="stylesheet" id="menustyle_menubottom" title="Bottom KGP" type="text/css" href="css/opmenu_menubottom.css">
<link rel="stylesheet" id="menustyle_menuright" title="Right KGP" type="text/css" href="css/opmenu_menuright.css">
<script src="js/opmenu.js"></script>

<script src="js/texts.js"></script>
<script src="js/js.cookie.min.js"></script>
<script src="opiframes.js"></script>

<meta http-equiv="cache-control" content="max-age=0" />
<meta http-equiv="cache-control" content="no-cache" />
<meta http-equiv="expires" content="0" />
<meta http-equiv="expires" content="Sat, 01 Mar 1975 1:00:00 GMT" />
<meta http-equiv="pragma" content="no-cache" />

</head>

<body id="op_wrapper">

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
<div id="mainview">
	<div id="nav_line" class="opmenu">
		<div class="opmenu_content">
			<div id="username">
				<div id="label_curr_user"></div><span id="current_user">Not logged in</span>
				<!--span class="hidden" id="label_curr_user">User: </span><br/><span id="current_user">Not logged in</span-->
			</div>
			<div id="op_nav">
				<button id="button_mail" class="nav_button close" target="frame_mail">
					<div class="nav_control nav-icon" id="nav_mail"> </div>
					<div class="nav_text" id="txt_nav_mail">Mail</div>
				</button>
				<button id="button_nc_files" class="nav_button close" target="frame_nc" data-app="files">
					<div class="nav_control nav-icon" id="nav_files"> </div>
					<div class="nav_text" id="txt_nav_files">Files</div>
				</button>
				<button id="button_nc_calendar" class="nav_button close" target="frame_nc" data-app="calendar">
					<div class="nav_control nav-icon" id="nav_cal"> </div>
					<div class="nav_text" id="txt_nav_cal">Calendar</div>
				</button>
				<button id="button_nc_contacts" class="nav_button close" target="frame_nc" data-app="contacts">
					<div class="nav_control nav-icon" id="nav_contacts"> </div>
					<div class="nav_text" id="txt_nav_contacts">Contacts</div>
				</button>
				<button id="button_nc_photos" class="nav_button close" target="frame_nc" data-app="photos">
					<div class="nav_control nav-icon" id="nav_gallery"> </div>
					<div class="nav_text" id="txt_nav_gallery">Gallery</div>
				</button>
				<button id="button_nc_tasks" class="nav_button close" target="frame_nc" data-app="tasks">
					<div class="nav_control nav-icon" id="nav_tasks"> </div>
					<div class="nav_text" id="txt_nav_tasks">Tasks</div>
				</button>
				<button id="button_admin" class="nav_button close" target="frame_admin">
					<div class="nav_control nav-icon" id="nav_admin"> </div>
					<div class="nav_text" id="txt_nav_admin">Admin</div>
				</button>
				<div id="top-nav-logout">
					<a href="#" class="top-nav" alt="Logout"><img src="<?=createThemepath("/img/logout_grey.png")?>" /></a>
				</div>
			</div>
			<div class="opmenu_settings">
				<div id="opmenu_pindiv">
					<input type="checkbox" id="opmenu_pinned" name="pinned" value="true">
					<label for="opmenu_pinned" class="opmenu_icon"></label>
				</div>
				<div id="opmenu_osel">
					<div id="opmenu_topsel">
						<input type="radio" id="opm_top" name="opmenu_orientation" value="0">
						<!-- label for="opm_top">Top</label><br -->
					</div>
					<div id="opmenu_rightsel">
						<input type="radio" id="opm_right" name="opmenu_orientation" value="1">
						<!-- label for="opm_right">Right</label><br -->
					</div>
					<div id="opmenu_bottomsel">
						<input type="radio" id="opm_bottom" name="opmenu_orientation" value="2">
						<!-- label for="opm_bottom">Bottom</label><br -->
					</div>
					<div id="opmenu_leftsel">
						<input type="radio" id="opm_left" name="opmenu_orientation" value="3">
						<!-- label for="opm_left">Left</label><br -->
					</div>
				</div>
			</div>
		</div>
		<div class="opmenu_togglebar">
			<img class="opmenu_grip" style="width:17px;" src="<?=createThemepath("img/grip-lines.png")?>" />
		</div>
	</div>
<div id="content">
	<iframe class="subpage z2" id="frame_admin" src = "admin.php"></iframe>
	<iframe class="subpage z1 z0" id="frame_loading" src = "loading.php"></iframe>
	<iframe class="subpage z3" id="frame_mail" ></iframe>
	<iframe class="subpage z4" id="frame_nc"></iframe>
</div>
</div>
</body>


</html>
