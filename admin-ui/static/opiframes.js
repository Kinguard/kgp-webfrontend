var FramesLoaded = {};
// always concider admin frame to be loaded since this is always has something to show.
FramesLoaded['frame_admin'] = true;

var currentFrame = 0;
var allow_loadscript = false;
var Frame_ref = {};


var FrameOrder = [
    "frame_admin",
	"frame_mail",
	"frame_oc_files",
	"frame_oc_cal",
	"frame_oc_contacts",
	"frame_oc_gallery"		
];

var FrameSrc = {
		frame_admin		  :	  "/admin/admin.html",
		frame_mail        :   "/mail/index.php",
		frame_oc_files    :   "/oc/index.php/apps/files/",
		frame_oc_cal      :   "/oc/index.php/apps/calendar/",
		frame_oc_contacts :   "/oc/index.php/apps/contacts/",
		frame_oc_gallery  :   "/oc/index.php/apps/gallery/"	
};
var activeFrame;

cookie_frame = $.cookie("current_frame");
if( FrameOrder.indexOf(cookie_frame) > 0 ) {
	// admin_frame is on index '0'
	activeFrame = $.cookie("current_frame");
	FrameOrder.splice(FrameOrder.indexOf(activeFrame),1);
	FrameOrder.splice(1,0,activeFrame);
} else {
	activeFrame = "frame_admin";
}

var TimeoutLeaveID;

function set_name(name) {
	$("#current_user").text(name);
}
function load_frame(id) {
	//console.log("loading frame: "+FrameSrc[id]);
	$("#"+id).attr('src',FrameSrc[id]);
}

var RC_waitlogin = false;
var OC_waitlogin = false;
var RC_waitlogout = false;
var OC_waitlogout = false;
var ADM_waitlogout = false;

function login(args) {
	// called when admin UI has verified login, pass the same to the owncloud and roundcube
	
	var oc_args = {};
	RC_waitlogin = true;
	OC_waitlogin = true;

	// get login args from owncloud page
	$("<div id='oc_login'>").load("/oc/index.php?login=true form",function() {
		if($(this).contents().find("input[name='install']").val()) {
			oc_args = { adminlogin: args.username, adminpass: args.password, 'adminpass-clone': args.password };
		} else {
			oc_args = { user: args.username, password: args.password };	
		}
		$.post( "/oc/", oc_args, function( data ) { 
			OC_waitlogin = false;
			if(! RC_waitlogin) {
				load_nextframe();		
			}
		});
	});
	
	// get token from RC page
	$("<div id='rc_login'>").load("/mail/?_task=login #login-form",function() {
		token = $(this).contents().find("input[name='_token']").val();
		$.post( "/mail/?_task=login", { 
			_user: args.username, 
			_pass: args.password,
			_token: token,
			_task: 'login',
			_action: 'login',
			_timezone : '',
			_url : ''
			}, function( data,status ) {
			RC_waitlogin = false;
			if(! OC_waitlogin) {
				load_nextframe();		
			}
		});
	});
}



function load_nextframe() {
	// this function is called from admin UI when it has finished loading.
	$("#label_curr_user").show();
	$("#top_header").show();
	view_frame(activeFrame);
	if(OC_waitlogin || RC_waitlogin) {
		return false;
	}

	if(!$.cookie("current_frame")) {
		// only show if we load directly after login
		$("#app-box").show();
	    TimeoutLeaveID = setTimeout(function() {
			  $("#app-box").hide(800);
		}, 6000);
	}
	currentFrame++;
	load_frame(FrameOrder[currentFrame]);
}

function redirect(timeout,url) {
	/*
	if(!url) {
		url = "/admin";
	}
	*/
	if(!OC_waitlogout && !ADM_waitlogout && !RC_waitlogout) {
		if(timeout > 0) {
			setTimeout(function() {
				/*
				location.href=url;		  
				*/
				location.href="/admin/index.html";
			}, timeout*1000);
		}
		
	}	
}

function logout(timeout,url) {
	RC_waitlogout = true;
	OC_waitlogout = true;
	ADM_waitlogout = true;
	$("#top_header").hide();
	$("#app-box").hide();

	$.get("/oc/index.php?logout=true", function(data,status) {
		//console.log("OC logout done");
	}).fail(function(){
		//console.log("OC logout call failed");
	}).always(function(){
		OC_waitlogout = false;
		redirect(timeout,url);
	});
	$.get("/mail/?_task=logout", function(data,status) {
		//console.log("RC logout done");
	}).fail(function(){
		//console.log("RC logout call failed");
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
	    		//console.log("ADM already logged out.");
	    	} else {
		    	//console.log("ADM logout fail: "+error);
	    	}
	    	redirect(timeout,url);
	    }
	});
}

function view_frame(Frame) {

	// add a class to top-header so it can be styled dependent on the current app being shown.
	$("#top_header").removeClass (function (index, css) {
    	return (css.match (/\bframe_\S+/g) || []).join(' ');
	});
	$("#top_header").addClass(Frame);
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

$(document).ready(function() {
	 $('.popbox').popbox();

	$(".subpage").load( function() {
		$(this).contents().find("body").click(function() {
			close_menu();
		});
		if(!FramesLoaded[FrameOrder[currentFrame]]) {
			FramesLoaded[FrameOrder[currentFrame]] = true;
			//console.log("Loaded frame: "+FrameOrder[currentFrame]);
			if(activeFrame == FrameOrder[currentFrame]) {
				// the frame is active, so hide the loader page and show the real one.
				$("#frame_loading").removeClass("z0");
				$(this).addClass("z0");
				$("#op_nav button[target='"+FrameOrder[currentFrame]+"']").children("div").addClass("active");
				
			}
			currentFrame++
			while (FramesLoaded[currentFrame] && (currentFrame <= FrameOrder.length)) {
				currentFrame++;
			}
			if(currentFrame < FrameOrder.length) load_frame(FrameOrder[currentFrame]);
		}
	});
	
	$(".nav_button").click(function() {
		activeFrame = $(this).attr("target");
		$(".nav_button").children("div").removeClass("active");
		$(this).children("div").addClass("active");
		$.cookie("current_frame",activeFrame);
		view_frame(activeFrame);
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
		view_frame("frame_loading");
		logout(0.1,"/admin");
	});
});
