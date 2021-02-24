var FramesLoaded = {};
// always concider admin frame to be loaded since this is always has something to show.
FramesLoaded['frame_admin'] = true;

var activeFrame = "frame_admin";
var currentFrame = 0;
var allow_loadscript = false;
var Frame_ref = {};
var RC_token = "";
var NC_token = "";
var current_user;
var cookie;
var baseurl = "/admin/apps.php";
var RC_waitlogin = false;
var NC_waitlogin = false;
var RC_waitlogout = false;
var NC_waitlogout = false;
var ADM_waitlogout = false;
var TimeoutLeaveID;
var DEBUG = false;

var FrameOrder = [
	"frame_admin",
	"frame_mail",
	"frame_nc"
];

var FrameSrc = {
	frame_admin		:	"/admin/admin.php",
	frame_mail      :   "/mail/index.php",
	frame_nc		: 	"/nc/index.php"
};
var FrameSrcDefaultApp = {
	frame_admin		:	"",
	frame_mail      :   "",
	frame_nc		: 	"/apps/files"
}

function debug_log(msg) {
	if (DEBUG) console.log(msg);
}

function set_name(name) {
	$("#current_user").text(name);
	current_user = name;
	debug_log("Trying to read cookie");
	if($.cookie(current_user)) {
		cookie = $.parseJSON($.cookie(current_user));

		
		debug_log("Cookie App: "+cookie.current_app);
		debug_log("Cookie Frame: "+cookie.current_frame);
		if (cookie.current_app) {
			$(".nav_button[data-app='"+cookie.current_app+"']").addClass("active");
		} else {
			$(".nav_button[target='"+cookie.current_frame+"']").addClass("active");	
		}
	}
	if( cookie && (FrameOrder.indexOf(cookie.current_frame) > 0) ) {
		// admin_frame is on index '0'
		activeFrame = cookie.current_frame;
		// reorder load sequence
		FrameOrder.splice(FrameOrder.indexOf(activeFrame),1);
		FrameOrder.splice(1,0,activeFrame);
	} else {
		activeFrame = "frame_admin";
	}


}
function load_frame(id) {
	if (cookie) {
		if (cookie.current_app) {
			FrameSrc[cookie.current_frame] = FrameSrc[cookie.current_frame]+"/apps/"+cookie.current_app;
		} else {
			FrameSrc[cookie.current_frame] = FrameSrc[cookie.current_frame]+FrameSrcDefaultApp[cookie.current_frame];
		}
	}
	debug_log("Start Frameload: "+FrameSrc[id]);
	$("#"+id).attr('src',FrameSrc[id]);
}


function login_NC(args) {
	var nc_args = {};

	nc_args = { user: args.username, password: args.password, requesttoken: NC_token };
			$.post( "/nc/index.php/login", nc_args, function( data ) { 
				NC_waitlogin = false;
					load_nextframe();		
	});
	
}

function login(args) {
	// called when admin UI has verified login, pass the same to the owncloud and roundcube
	debug_log("Login");
	RC_waitlogin = true;
	NC_waitlogin = true;

	// only need to logout NC, RC handles change of user when a new login is done.
	NC_logout(0,"",app_login,args);

	/*
	logout_url="/nc/index.php/logout?requesttoken="+NC_token;
	debug_log("LOGOUT URL: "+logout_url);
	$.get(logout_url, function(data,status) {
		debug_log("NC preventive logout");
	}).always(function(){
		app_login(args);
	});
	*/
	
}

function getRC_token(data) {
	var token_pattern = /request_token\"\s*\:\s*\"(\w+)\"/;
	var match = token_pattern.exec(data);
	var token;
	try {
		token = match[1];
		// debug_log("Found RC token: " + token);
		}
	catch(e) {
			debug_log("Failed to match request token");
		}
	return token;
}

function app_login(args) {
	
	debug_log("APP Login");
	// get token from RC page
	$.get("/mail/?_task=login", function(data) {
		//token = $(data).contents().find("input[name='_token']").val();
		RC_token = getRC_token(data);
		$.post( "/mail/?_task=login", { 
			_user: args.username, 
			_pass: args.password,
			_token: RC_token,
			_task: 'login',
			_action: 'login',
			_timezone : '',
			_url : ''
			}, function( data,status ) {
				//RC_token = getRC_token(data);
				RC_waitlogin = false;
				login_NC(args);
		});
	});
}

function set_url(url) {
	location.href=url;
}

function load_nextframe() {
	// this function is called from admin UI when it has finished loading.

	debug_log("load_nextframe");
	menu.show();
	view_frame(activeFrame);
	
	if(NC_waitlogin || RC_waitlogin) {
		debug_log("Apps not loaded yet");
		return false;
	}

	if(!cookie || !cookie.current_frame) {
		// only show if we load directly after login
		$("#app-box").show();
		TimeoutLeaveID = setTimeout(function() {
			  $("#app-box").hide(800);
		}, 6000);
	}
	currentFrame++;
	debug_log("Current Frame: " + currentFrame);
	load_frame(FrameOrder[currentFrame]);
}

function redirect(timeout,url) {
	if(!NC_waitlogout && !ADM_waitlogout && !RC_waitlogout) {
		debug_log("Trying to redirect");
		setTimeout(function() {
			$.ajax({
	        	type: "HEAD",
	        	async: true,
	        	timeout: 2000,
	        	url : baseurl
			})
			.done(function(){
					set_url(baseurl);
				})
			.fail(function(){
					debug_log("UI not available, waiting");
					redirect(0,baseurl);
			});
		}, 5000);
	}	
}

function logout_cancel() {
	$("#confirm_logout").addClass("hidden");
	$("#confirm_logout_backdrop").addClass("hidden");
	$("#confirm_logout_backdrop").css({ opacity: 0 });}

function icon_logout(timeout,url) {
	$("#confirm_logout_backdrop").removeClass("hidden");
	$("#confirm_logout_backdrop").animate({ 'opacity': 0.5 },100, function() {
		$("#confirm_logout").removeClass("hidden");
		$("#btn_logout_confirm").focus();
	});
	$("#btn_logout_confirm").click(function() {
		$("#confirm_logout").addClass("hidden");
		view_frame("frame_loading");
		logout(timeout,url);
	});
}

function NC_logout(timeout=0,url="",callback,cb_args) {
	logout_url = "/nc/index.php/logout?requesttoken="+encodeURIComponent(NC_token);
	debug_log("URL" + logout_url);
	$.ajax(
		{ 	url: logout_url,
			headers: { 'OCS-APIRequest': 'true'}
		})
	.done(function(response,status,xhr){
			debug_log(status);
			debug_log(xhr);
			debug_log("NC logout done");
		})
	.fail(function(){
			debug_log("NC logout call failed");
		})
	.always(function(){
			debug_log("Running 'always'");
			if(timeout && url) {
				NC_waitlogout = false;
				redirect(timeout,url);
			}
			if (typeof callback != "undefined") {
				debug_log("Running 'callback'");
				callback(cb_args);
			}
		});
}

function logout(timeout,url) {
	RC_waitlogout = true;
	NC_waitlogout = true;
	ADM_waitlogout = true;
	menu.hide();
	$("#app-box").hide();

	debug_log("NC token: " + NC_token);
	NC_logout(timeout,url);

	$.get("/mail/?_task=logout&_token="+RC_token, function(data,status) {
		//debug_log("RC logout done");
	}).fail(function(){
		//debug_log("RC logout call failed");
	}).always(function(){
		RC_waitlogout = false;
		redirect(timeout,url);
	});
	
	$.ajax({
		url: '/admin/index.php/api/session',
		type: 'DELETE',
		success: function(result,status) {
			// logged out
			ADM_waitlogout = false;
			redirect(timeout,url);
		 },
		error: function(xhr,StrStatus,error) {
			ADM_waitlogout = false;
			if(xhr.status == 405) { // session already deleted
				//debug_log("ADM already logged out.");
			} else {
				//debug_log("ADM logout fail: "+error);
			}
			redirect(timeout,url);
		}
	});
}

function view_frame(Frame) {

	$(".subpage").removeClass("z0");
	if(FramesLoaded[Frame]) {
		$("#"+Frame).addClass("z0");
	} else {
		$("#frame_loading").addClass("z0");
	}
	//$("#page_header").html(texts[Frame]);
	
}
function close_menu(){
	$("#app-box").hide(800);
}

function set_frame(activeFrame,app="") {
		location.hash = activeFrame;
		debug_log("Setting cookie with current Frame: "+activeFrame+" and current App: "+app);
		if (app) {
			$.cookie(current_user,'{"current_frame" : "'+activeFrame+'","current_app" : "'+app+'"}');			
		} else {
			$.cookie(current_user,'{"current_frame" : "'+activeFrame+'"}');
		}

		view_frame(activeFrame);
}

function setTitle() {
	$.get( "index.php/api/system/type", function( data ) {
		switch (data.typeText) {
		 	case ("Armada"):
				$("title").text("KEEP - "+$("title").text());
				console.log("Setting frame title to KEEP");
				break;
		 	default:
				$("title").text(data.typeText.toUpperCase()+" - "+$("title").text());
				console.log("Setting frame title to"+data.typeText);
				break;
		}
	});
}

function update_nav(app) {
	debug_log("NavButton update, id: "+$(app).attr("data-app"));
	if ($(app).hasClass("active")) {
		// a click on the current active item
		debug_log("Already on the active item.");
	} else {
		if ($(app).attr("data-app")) {
			// Set the subpage of the frame
			debug_log("Page SRC:");
			debug_log($("#"+$(app).attr("target")).attr("src"));
			if( $("#"+$(app).attr("target")).attr("src").includes("/apps/"+$(app).attr("data-app")) ) {
				debug_log("Already on the active subpage");
			} else {
				$("#"+$(app).attr("target")).attr("src","/nc/index.php/apps/"+$(app).attr("data-app"));
			}
		}
	}

	$(app).parent().children().removeClass("active");
	$(app).addClass("active");

}

var menu;

$(document).ready(function() {

	menu = new Menu($("#nav_line"));
	menu.hide();
	setTitle();

	debug_log("Starting load");
	$(".subpage").on("load", function() {
		debug_log("Loading: "+$(this).attr("id"));

		frame_id = $(this).attr('id');
		if( frame_id == "frame_nc") {
			// get the token from the page
			NC_token = $(this).contents().find("head").attr("data-requesttoken");
			debug_log("NC_token:" + NC_token);
			isrc=$(this).attr("src");
			app=isrc.substr(isrc.lastIndexOf('/')+1);
			if(app != "loading.php") {
				$(this).contents().find("html").addClass("app_"+app);
				update_nav(".nav_button[data-app='"+app+"']");
			}
		}

		if( frame_id == "frame_mail") {
			// get the token from the page
			RC_token = $(this).contents().find("input[name=_token]").val();
		}
		$(this).contents().find("body").click(function() {
			// any click anywhere should close the OP-menu.
			close_menu();
		});

		if(!FramesLoaded[FrameOrder[currentFrame]]) {
			FramesLoaded[FrameOrder[currentFrame]] = true;
			debug_log("Current frame: "+currentFrame);
			debug_log("Loaded frame: "+FrameOrder[currentFrame]);
			if(activeFrame == FrameOrder[currentFrame]) {
				// the frame is active, so hide the loader page and show the real one.
				$("#frame_loading").removeClass("z0");
				$(this).addClass("z0");
				
			}
			//currentFrame++
			while (FramesLoaded[FrameOrder[currentFrame]] && (currentFrame < FrameOrder.length)) {
				// advance pointer if the frame is alreay loaded.
				currentFrame++;
			}
			if(currentFrame < FrameOrder.length) load_frame(FrameOrder[currentFrame]);
		}
	});
	
	$(".nav_button").click(function() {

		debug_log("Calling setframe from navbutton");
		set_frame($(this).attr("target"),$(this).attr("data-app"));
		menu.close();
		update_nav(this);

	});
	
	
	$("#app-box").mouseenter(function() {
		  clearTimeout(TimeoutLeaveID);
	});
	
	$("#app-box").mouseleave(function() {
		  TimeoutLeaveID = setTimeout(function() {
			  $("#app-box").hide(800);
		  }, 4000);
	});
	
	
	$("#op_nav button").hover(function() {
		$(this).children().toggleClass("hover");
	});		
	
	$("#top-nav-logout a").click(function(e) {
		e.preventDefault();
		icon_logout(0.1,"/admin");
	});
	$("#btn_logout_confirm").on('keydown',function(e){
		if(e.which == 27) {
			// hide dialog if 'esc' is pressed
			logout_cancel();
		}
	});

	$(window).on('hashchange', function (e) {
		frame = location.hash.substr(1);
		target_src=$("#"+frame).attr('src');
		if( target_src == "loading.php") {
			set_url(baseurl);
		} else {
			pattern = /\/apps\/(\w+)/;
			var app = pattern.exec(target_src);
			if (app != null) {
				debug_log("HASH CHANGE APP: " + app[1]);
				set_frame(frame,app[1]);
			} else {
				debug_log("HASH CHANGE");
				set_frame(frame);
			}
		}
	});

});
