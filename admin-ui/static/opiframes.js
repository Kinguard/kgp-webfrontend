var FramesLoaded = {};
// always concider admin frame to be loaded since this is always has something to show.
FramesLoaded['frame_admin'] = true;

var activeFrame = "frame_admin";

// Pointer into FrameOrder
var currentFrame = 0;
var FrameOrder = [
	"frame_admin",
	"frame_mail",
	"frame_nc"
];

var FrameSrc = {
	frame_admin	:	"/admin/admin.php",
	frame_mail      :	"/mail/index.php",
	frame_nc	: 	"/nc/index.php"
};

var FrameSrcDefaultApp = {
	frame_admin	:	"",
	frame_mail      :	"",
	frame_nc	:	"/apps/files"
}

var current_user;
var cookie;
var baseurl = "/admin/apps.php";
var DEBUG = true;

class WebApp
{
	constructor(name)
	{
		this.name = name;
		this.frame = null;
		this.page = null;
		this.waitlogin = false;
		this.waitlogout = false;
		this.token = "";
		this.src = "";
		this.loaded = false;
		debug_log(this.name + " class created");
	}

	log(msg)
	{
		debug_log("WebApp ("+this.name+"): "+msg);
	}

	login()
	{
		this.log("login");
	}

	logout()
	{
		this.log("logout");
	}

	load()
	{
		this.frame.src = this.src;
	}

	onload()
	{
		this.log("onload");
		this.frame = document.getElementById(this.name);
		this.page = this.frame.contentWindow.document;
		this.loaded = true;
		debug_log(this.page);
		this.log("onload page dumped");
	}

	static frameToApp(frame)
	{
		return frame.substr(frame.lastIndexOf("_")+1);
	}

	static appToFrame(app)
	{
		return "frame_"+app;
	}
}

class RCApp extends WebApp
{
	constructor()
	{
		super("frame_mail");
		this.src = "/mail/index.php";
	}

	onload()
	{
		super.onload();
		//debug_log($(this.page).contents());
		var token = $(this.page).contents().find("input[name=_token]").val();
		if( token != undefined )
		{
			this.token = token;
			this.log("Token "+this.token);
		}
		else
		{
			this.log("No token provided");
		}
	}

	logout(timeout, url)
	{
		super.logout();
		$.ajax( {
				url: "/mail/?_task=logout&_token="+this.token,
				context: this
			})
		.done( function( response, stat, xhr)
			{
				debug_log("RC logout done");
			})
		.fail( function()
			{
				debug_log("RC logut call failed");
			})
		.always( function()
			{
				this.waitlogout = false;
				redirect( timeout, url);
			});
	}


	login(args)
	{
		super.login();
		// Retrieve login token
		$.ajax( {
				url: "/mail/?_task=login",
				context: this
			})
		.done( function( response, stat, xhr)
			{
				debug_log("RC retrieve token done");
				this.token = RCApp.getToken(response);
				$.ajax( {
					url:	"/mail/?_task=login",
					data: { 
						'_user': args.username,
						'_pass': args.password,
						'_token': this.token,
						'_task': 'login',
						'_action': 'login',
						'_timezone': '',
						'_url': ''
					},
					context: this,
					type: "POST"
				})
				.done( function( response, stat, xhr )
					{
						debug_log("RC login request succeded");
						//debug_log(response);
						this.waitlogin = false;
					})
				.fail( function()
					{
						debug_log("RC login call failed");
					});
			})
		.fail( function()
			{
				debug_log("RC retrieve token call failed");
			});

	}

	static getToken(data) {
		var token_pattern = /request_token\"\s*\:\s*\"(\w+)\"/;
		var match = token_pattern.exec(data);
		var token;
		try
		{
			token = match[1];
			debug_log("Found RC token: " + token);
		}
		catch(e)
		{
			debug_log("Failed to match request token");
		}
		return token;
	}
}

class NCApp extends WebApp
{
	constructor()
	{
		super("frame_nc");
		this.src = "/nc/index.php";
	}

	onload()
	{
		super.onload();
		this.token = $(this.page).contents().find("head").attr("data-requesttoken");
		this.log("Token: "+ this.token);
		debug_log(this.page);
		var isrc = $(this.page).attr("URL");
		this.log("Src: "+isrc);
		
		var app = isrc.substr(isrc.lastIndexOf('/')+1);
		this.log("App: "+app);
		
		if( app != "loading.php" )
		{
			$(this.page).contents().find("html").addClass("app_"+app);
			update_nav(".nav_button[data-app='"+app+"']");
		}
	}

	login(args)
	{
		super.login();
		let nc_args = {};

		nc_args = { user: args.username, password: args.password, requesttoken: this.token };

		$.ajax( {
				url:	"/nc/index.php/login",
				headers: { 'OCS-APIRequest': 'true'},
				data:	nc_args,
				context: this,
				type: "POST"
			})
		.done( function( response, stat, xhr )
			{
				debug_log("NC login request succeded");
				//debug_log(response);
				this.waitlogin = false;
				load_nextframe();
			})
		.fail( function()
			{
				debug_log("NC login failed");
			});

		debug_log("login completed");
	}

	logout(timeout = 0, url = "", callback, cb_args)
	{
		super.logout();
		let logout_url = "/nc/index.php/logout?requesttoken="+encodeURIComponent(this.token);
		debug_log("URL" + logout_url);

		$.ajax(	{
				url: logout_url,
				headers: { 'OCS-APIRequest': 'true'},
				context: this
			})
		.done( function( response, stat, xhr )
			{
				//debug_log(stat);
				//debug_log(xhr);
				debug_log("NC logout done");
			})
		.fail( function()
			{
				debug_log("NC logout failed");
			})
		.always( function()
			{
				debug_log("Running NC logout 'always'");
				if( timeout && url )
				{
					this.waitlogout = false;
					redirect(timeout, url);
				}

				if( typeof callback != "undefined")
				{
					debug_log("NC logout running 'callback'");
					callback(cb_args);
				}
			});
	}

}

class ADMApp extends WebApp
{
	constructor()
	{
		super("frame_admin");
		this.src = "/admin/admin.php";
	}

	// Login provided by opiapp which calls into opiframes

	logout(timeout, url)
	{
		super.logout();
		$.ajax(
			{
				url: '/admin/index.php/api/session',
				type: 'DELETE',
				context: this,
				success: function(result, stat)
				{
					this.waitlogout = false;
					redirect(timeout, url);
				},
				error: function( xhr, stat, error )
				{
					this.waitlogout = false;
					if( xhr.status == 405 )
					{
						debug_log("ADM already logged out?=");
					}
					else
					{
						debug_log("ADM logout failed: " + error);
					}
					redirect( timeout, url);
				}
			});
	}
}


function debug_log(msg) {
	if (DEBUG) console.log(msg);
}

// Called from opiadmin app upon login
function set_name(name) {
	$("#current_user").text(name);
	current_user = name;
	debug_log("Trying to read cookie");
	if($.cookie(current_user)) {
		cookie = $.parseJSON($.cookie(current_user));

		
		debug_log("Cookie App: "+cookie.current_app);
		debug_log("Cookie Frame: "+cookie.current_frame);
		// Update menu with user stored app
		if (cookie.current_app)
		{
			// Select element by app-assigned "data-app" attribute
			$(".nav_button[data-app='"+cookie.current_app+"']").addClass("active");
		} 
		else 
		{
			// Select element by target frame
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
	debug_log("Start Frameload: "+FrameSrc[id] + " id: " + id);
	$("#"+id).attr('src',FrameSrc[id]);
}

function login(args) {
	// called when admin UI has verified login, pass the same to the owncloud and roundcube
	debug_log("Login");
	apps.mail.waitlogin = true;
	apps.nc.waitlogin = true;

	// only need to logout NC, RC handles change of user when a new login is done.
	apps.nc.logout(0, "", app_login, args);
}

function app_login(args)
{
	debug_log("APP Login");

	apps.mail.login(args);
	apps.nc.login(args);
}

function set_url(url) 
{
	location.href=url;
}

function load_nextframe()
{
	// this function is called from admin UI when it has finished loading.

	debug_log("load_nextframe");
	menu.show();
	view_frame(activeFrame);
	
	if(apps.nc.waitlogin || apps.mail.waitlogin) {
		debug_log("Apps not loaded yet: " + apps.nc.waitlogin + " " + apps.mail.waitlogin);
		return false;
	}

	currentFrame++;
	debug_log("Current Frame: " + currentFrame);
	load_frame(FrameOrder[currentFrame]);
}

function redirect(timeout,url)
{
	debug_log("Redirect: " + url + " timeout: " + timeout);
	if(!apps.nc.waitlogout && !apps.admin.waitlogout && !apps.mail.waitlogout)
	{
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
	else
	{
		debug_log("Not redirecting "+apps.nc.waitlogout +" "+ apps.admin.waitlogout +" "+ apps.mail.waitlogout);
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

function logout(timeout,url)
{
	apps.mail.waitlogout = true;
	apps.nc.waitlogout = true;
	apps.admin.waitlogout = true;
	menu.hide();

	//debug_log("NC token: " + apps.nc.token);

	apps.nc.logout(timeout, url);
	apps.mail.logout(timeout, url);
	apps.admin.logout(timeout, url);
}

function view_frame(Frame)
{

	$(".subpage").removeClass("z0");
	
	var app = WebApp.frameToApp(Frame);

	debug_log("view_frame: "+Frame+" app "+app);
	if( apps.hasOwnProperty(app) && apps[app].loaded )
	{
		$("#"+Frame).addClass("z0");
	} else {
		$("#frame_loading").addClass("z0");
	}

	/*
	if(FramesLoaded[Frame]) 
	{
		$("#"+Frame).addClass("z0");
	} else {
		$("#frame_loading").addClass("z0");
	}
	*/
}

function set_frame(activeFrame,app="") {
	// Todo: move to local storage, as menu uses.
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
			case ("Unknown"):
				$("title").text("KinGuard - "+$("title").text());
				break;
		 	default:
				$("title").text(data.typeText.toUpperCase()+" - "+$("title").text());
				console.log("Setting frame title to: "+data.typeText);
				break;
		}
	});
}

function update_nav(app) {
	debug_log("NavButton update, id: "+$(app).attr("data-app")+"("+app+")");
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
var apps =
	{
		'admin' : new ADMApp(),
		'mail' : new RCApp(),
		'nc' : new NCApp()
	};

$(document).ready(function() {

	menu = new Menu($("#nav_line"));
	menu.hide();
	setTitle();

	debug_log("Starting load");

	$("#frame_admin").on("load", apps.admin.onload.bind(apps.admin));
	$("#frame_mail").on("load", apps.mail.onload.bind(apps.mail));
	$("#frame_nc").on("load", apps.nc.onload.bind(apps.nc));

	$(".subpage").on("load", function() {
		debug_log("Loading: "+$(this).attr("id"));

		$(this).contents().find("body").click(function() {
			// any click anywhere should close the OP-menu.
			menu.close();
		});
/*
		if(!FramesLoaded[FrameOrder[currentFrame]])
		{
			FramesLoaded[FrameOrder[currentFrame]] = true;
		
			debug_log("Current frame: "+currentFrame);
			debug_log("Loaded frame: "+FrameOrder[currentFrame]);
			
			if(activeFrame == FrameOrder[currentFrame])
			{
				// the frame is active, so hide the loader page and show the real one.
				$("#frame_loading").removeClass("z0");
				$(this).addClass("z0");
				
			}

			while (FramesLoaded[FrameOrder[currentFrame]] && (currentFrame < FrameOrder.length))
			{
				// advance pointer if the frame is alreay loaded.
				currentFrame++;
			}

			if(currentFrame < FrameOrder.length)
			{
				load_frame(FrameOrder[currentFrame]);
			}
		}
*/
	});
	
	$(".nav_button").click(function() {

		debug_log("Calling setframe from navbutton");
		set_frame($(this).attr("target"),$(this).attr("data-app"));
		menu.close();
		update_nav(this);

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
