var FramesLoaded = {};
// always concider admin frame to be loaded since this is always has something to show.
FramesLoaded['frame_admin'] = true;

var activeFrame = "frame_admin";

// Pointer into FrameOrder
/*
var currentFrame = 0;
var FrameOrder = [
	"frame_admin",
	"frame_mail",
	"frame_nc"
];
*/
/*
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
*/

//var current_user;
//var cookie;
var baseurl = "/admin/apps.php";
var DEBUG = true;


function debug_log(msg) {
	if (DEBUG) console.log(msg);
}

// Global objects
var menu;
var apps;
var store;

/*
 * Localstorage wrapper to store objects as stringified json
 * all keys are prefixed with a "namespace" prefix
 */
class Storage
{
	constructor(prefix)
	{
		this.prefix = prefix+"_";
	}


	initialize(obj)
	{
		for( const key in obj)
		{
			this.set(key,obj[key]);
		}
	}

	get(key)
	{
		if( localStorage.hasOwnProperty(this.prefix+key) )
		{
			return JSON.parse(localStorage.getItem(this.prefix+key))
		}
		return null;
	}

	set(key, value)
	{
		localStorage.setItem(this.prefix+key, JSON.stringify(value));
	}

	has(key)
	{
		return localStorage.hasOwnProperty(this.prefix+key);
	}
}

/*
 * Base class for web-apps
 * wraps an iframe and manage an app running within.
 */
class WebApp
{
	constructor(name)
	{
		this.name = name;
		this.frame = document.getElementById(this.name);
		this.page = null;
		this.waitlogin = false;
		this.waitlogout = false;
		this.token = "";
		this.src = "";
		this.loaded = false;
		this.log("class created");
		this.loggedin = false;
	}

	show()
	{
		this.log("Show");
		if( ! this.loaded )
		{
			this.log("Show called before page loaded!");
		}
		this.frame.classList.add("z0");
	}

	hide()
	{
		this.log("Hide");
		this.frame.classList.remove("z0");
	}

	log(msg)
	{
		debug_log("WebApp ("+this.name+"): "+msg);
	}

	login()
	{
		this.log("login");
		this.loggedin = true;
	}

	isLoggedIn()
	{
		return this.loggedin;
	}

	logout()
	{
		this.log("logout");
		this.loggedin = false;
	}

	load()
	{
		this.frame.src = this.src;
	}

	onload()
	{
		this.log("onload");
		this.page = this.frame.contentWindow.document;

		$(this.page).contents().find("body").click(function() {
			// any click anywhere should close the OP-menu.
			menu.close();
		});
		
		this.loaded = true;
		//debug_log(this.page);
		//this.log("onload page dumped");
	}

	static frameToApp(frame)
	{
		return frame.substr(frame.lastIndexOf("_")+1);
	}

	static appToFrame(app)
	{
		return "frame_"+app;
	}

	static fromID(id)
	{
		return apps[id];
	}

	static fromFrame(frame)
	{
		return apps[WebApp.frameToApp(frame)];
	}

	static hideAll()
	{
		for( const app in apps)
		{
			apps[app].hide();
		}
	}
}

class LoadingApp extends WebApp
{
	constructor()
	{
		super("frame_loading");
		$(this.frame).on("load", this.onload.bind(this));
		this.src = "loading.php";
	}
}

/*
 * RoundCube Webapp
 */
class RCApp extends WebApp
{
	constructor()
	{
		super("frame_mail");
		$(this.frame).on("load", this.onload.bind(this));
		this.src = "/mail/index.php";
	}

	onload()
	{
		super.onload();
		//debug_log($(this.page).contents());
		let token = $(this.page).contents().find("input[name=_token]").val();
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

	isLoggedIn()
	{
		if( this.page && this.page.defaultView.rcmail.env.hasOwnProperty("user_id") )
		{
			return true;
		}
		return false;
	}

	static getToken(data) {
		let token_pattern = /request_token\"\s*\:\s*\"(\w+)\"/;
		let match = token_pattern.exec(data);
		let token;
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

/*
 * Nextcloud webapp
 */
class NCApp extends WebApp
{
	constructor()
	{
		super("frame_nc");
		$(this.frame).on("load", this.onload.bind(this));
		this.src = "/nc/index.php";
		this.current = "";
	}

	onload()
	{
		super.onload();
		this.token = $(this.page).contents().find("head").attr("data-requesttoken");
		this.log("Token: "+ this.token);
		debug_log(this.page);

		let isrc = $(this.page).attr("URL");
		this.current = isrc.substr(isrc.lastIndexOf('/')+1);
	}

	load(sub="")
	{
		this.log("load: "+sub+" ("+this.current+")");
		this.frame.src = this.src + "/apps/"+sub;
		this.current = sub;
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
				this.loggedin = true;
				load_nextframe();
			})
		.fail( function()
			{
				debug_log("NC login failed");
			});

		debug_log("login completed");
	}

	isLoggedIn()
	{
		if( this.page && $(this.page).contents().find("head").attr("data-user"))
		{
			return true;
		}
		return false;
	}

	getUser()
	{
		return $(this.page).contents().find("head").attr("data-user");
	}


	logout(timeout = 0, url = "", callback, cb_args)
	{
		super.logout();
		let logout_url = "/nc/index.php/logout?requesttoken="+encodeURIComponent(this.token);
		//debug_log("URL" + logout_url);

		$.ajax(	{
				url: logout_url,
				headers: { 'OCS-APIRequest': 'true'},
				context: this
			})
		.done( function( response, stat, xhr )
			{
				//debug_log(stat);
				//debug_log(xhr);
				this.log("NC logout done");
				this.loggedin = false;
			})
		.fail( function()
			{
				this.log("NC logout failed");
			})
		.always( function()
			{
				this.log("Running NC logout 'always'");
				if( timeout && url )
				{
					this.waitlogout = false;
					redirect(timeout, url);
				}

				if( typeof callback != "undefined")
				{
					this.log("NC logout running 'callback'");
					callback(cb_args);
				}
			});
	}

}

/*
 * Admin app
 */
class ADMApp extends WebApp
{
	constructor()
	{
		super("frame_admin");
		$(this.frame).on("load", this.onload.bind(this));
		this.src = "/admin/admin.php";
	}

	isLoggedIn()
	{
		if( this.page && this.page.getElementById("admin"))
		{
			return this.page.defaultView.angular.element(this.page.getElementById("admin")).scope().user.isLogged();
		}
		return false;
	}


	getUser()
	{
		if( this.page && this.page.getElementById("admin"))
		{
			return this.page.defaultView.angular.element(this.page.getElementById("admin")).scope().user.username;
		}
		return "";
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

/*
 * Class coordinating app visualizing and synchronization
 */
class AppManager
{
	constructor()
	{
		this.log("Constructed");
	}

	log(msg)
	{
		debug_log("AppMGR: "+msg);
	}
}


// Called from opiadmin app upon login
function set_name(name) {
	$("#current_user").text(name);
	store.set("user",name);
	//current_user = name;

	debug_log("Read config");
	debug_log("Config App: "+store.get("app"));
	debug_log("Config Frame: "+store.get("frame"));
	
	// Update menu with user stored app
	if (store.get("app"))
	{
		// Select element by app-assigned "data-app" attribute
		$(".nav_button[data-app='"+store.get("app")+"']").addClass("active");
	} 
	else 
	{
		// Select element by target frame
		$(".nav_button[target='"+store.get("frame")+"']").addClass("active");	
	}
}

function load_frame(id) {

	let app = apps[WebApp.frameToApp(id)];
	let subapp = "";

	if( store.get("app") )
	{
		subapp = store.get("app");;
	}
	debug_log("load_frame:"+id+ " app " + subapp);

	app.load(subapp);
}

// Called externally from opiadmin
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

	for( const app in apps)
	{
		apps[app].login(args);
	}
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
	view_frame(store.get("frame"));
	
	if(apps.nc.waitlogin || apps.mail.waitlogin) {
		debug_log("Apps not loaded yet: " + apps.nc.waitlogin + " " + apps.mail.waitlogin);
		return false;
	}
/*
	currentFrame++;
	debug_log("Current Frame: " + currentFrame);
	load_frame(FrameOrder[currentFrame]);
*/
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
	for(const app in apps)
	{
		apps[app].logout(timeout, url);
	}
}

function view_frame(Frame)
{
	WebApp.hideAll();
	let app = WebApp.frameToApp(Frame);

	debug_log("view_frame: "+Frame+" app "+app);
	if( apps.hasOwnProperty(app) && apps[app].loaded )
	{
		apps[app].show();
	} else {
		debug_log("Not loaded? "+ apps[app].loaded);
		apps["loading"].show();
	}
}

function set_frame(activeFrame,app="") {
	location.hash = activeFrame;
	debug_log("Update config, current Frame: "+activeFrame+", App: "+app);
	store.set("frame",activeFrame);
	store.set("app", app);

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

$(document).ready(function() {

	menu = new Menu($("#nav_line"));
	menu.hide();
	
	store = new Storage("opiadmin");

	if( ! store.has("user") )
	{
		debug_log("Initialize config");
		store.initialize( {
			"user": "",
			"frame": "admin",
			"app": ""
		});
	}

	apps =
	{
		'admin' : new ADMApp(),
		'mail' : new RCApp(),
		'nc' : new NCApp(),
		'loading': new LoadingApp()
	};

	apps.mail.load();
	apps.nc.load();

	setTitle();

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
			let app = pattern.exec(target_src);
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
