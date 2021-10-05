var baseurl = "/admin/apps.php";
var DEBUG = true;

function debug_log(msg) {
	if (DEBUG) console.log(msg);
}

// Global objects
var menu;
var apps;
var mgr;
var store;

/*
 * Base class for storage. Store objects as stringified json
 * all keys are prefixed with a "namespace" prefix
 */
class Storage
{
	constructor(prefix)
	{
		this.prefix = prefix+"_";
		this.log("Created");
	}

	initialize(obj)
	{
		this.log("Initialize");
		for( const key in obj)
		{
			this.log("Key: "+key+" val: "+obj[key]);
			this.set(key,obj[key]);
		}
	}

	doGet(key)
	{
		console.error("Missing get implementation");
	}

	doSet(key, value)
	{
		console.error("Missing set implementation");
	}

	doHas(key)
	{
		console.error("Missing has implementation");
	}

	get(key)
	{
		this.log("Get: "+key);
		return JSON.parse(this.doGet(this.prefix+key));
	}

	set(key, value)
	{
		this.log("Set: "+key+" : "+value);
		this.doSet(this.prefix+key, JSON.stringify(value));
	}

	has(key)
	{
		this.log("Has: "+key);
		return this.doHas(this.prefix+key);
	}

	log(msg)
	{
		//debug_log("Store ("+this.prefix+"): "+msg);
	}

}

/*
* Storage class implementation storing data in local storage
*/
class LocalStorage extends Storage
{
	doGet(key)
	{
		if( localStorage.hasOwnProperty(key) )
		{
			return localStorage.getItem(key);
		}
		return null;
	}

	doSet(key, value)
	{
		localStorage.setItem(key, value);
	}

	doHas(key)
	{
		return localStorage.hasOwnProperty(key);
	}
}

/*
* Storage class implementation storing data in cookie
*/
class CookieStorage extends Storage
{

	doGet(key)
	{
		if( this.doHas(key) )
		{
			return $.cookie(key);
		}
		return null;
	}

	doSet(key, value)
	{
		$.cookie(key, value);
	}

	doHas(key)
	{
		return !(typeof $.cookie(key) === "undefined");
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
		this.waitlogout = false;
		this.token = "";
		this.src = "";
		this.subapp = "";
		this.loaded = false;
		this.loggedin = false;
		this.viewonload = false; // Should this app be visible when loaded?
		this.log("class created");
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

	load(subapp = "", force = false)
	{
		this.log("load (app:"+subapp+")");

		if( !force && this.loaded && this.frame.src != "" )
		{
			let url = new URL(this.frame.src);
			if( url.pathname == this.src )
			{
				this.log("Page already loaded");
				return;
			}
		}

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

		if( this.viewonload == true )
		{
			// Loading page shown while loading, now show loaded page
			this.show();
			this.viewonload = false;
		}
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

		let token = $(this.page).contents().find("input[name=_token]").val();
		if( token != undefined )
		{
			this.token = token;
			//this.log("Token "+this.token);
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
				this.log("logout done");
			})
		.fail( function()
			{
				this.log("logout call failed");
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
				this.log("retrieve token done");
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
						this.log("login request succeded");
						// Forde page reload
						this.load("",true);
					})
				.fail( function()
					{
						this.log("login call failed");
					});
			})
		.fail( function()
			{
				this.log("retrieve token call failed");
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
			//debug_log("Found RC token: " + token);
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
		//this.log("Token: "+ this.token);
		//debug_log(this.page);

		let isrc = new URL($(this.page).attr("URL"));
		let ptarr = isrc.pathname.split("/");
		if( ptarr.length > 3 )
		{
			this.current = ptarr[4];
		}
		//this.log("Src: "+isrc.pathname+" current: " + this.current);
	}

	load(sub="", force = false)
	{
		this.log("load: "+sub+" (last: "+this.current+")");

		if( !force && this.current != "" && this.current == sub )
		{
			this.log("Page already loaded");
			return;
		}

		this.frame.src = this.src + "/apps/"+sub;
		this.current = sub;
	}


	login(args)
	{
		super.login();

		//let nc_args = {};
		let nc_args = { user: args.username, password: args.password, requesttoken: this.token };

		$.ajax( {
				url:	"/nc/index.php/login",
				headers: { 'OCS-APIRequest': 'true'},
				data:	nc_args,
				context: this,
				type: "POST"
			})
		.done( function( response, stat, xhr )
			{
				this.log("login request succeded");
				//debug_log(response);
				this.loggedin = true;
				// Force page reload
				this.load(this.current, true);
			})
		.fail( function( xhr, textStatus, errorThrown)
			{
				//this.log("login failed: "+textStatus);
				this.log("Err thrown: "+ errorThrown);
				//debug_log(xhr);
			});

		this.log("login completed");
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
						this.log("ADM already logged out?");
					}
					else
					{
						this.log("ADM logout failed: " + error);
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

		// Initialize apps
		apps =
		{
			'admin' : new ADMApp(),
			'mail' : new RCApp(),
			'nc' : new NCApp(),
			'loading': new LoadingApp()
		};

		this.log("Constructed");
		this.default = "admin";
		this.args = null;
	}

	loadApps(force=false)
	{
		this.log("Load apps");
		apps.mail.load("", force);
		apps.nc.load("", force);
	}

	login(args)
	{
		this.log("Login");
		this.args = args;
		for( const app in apps)
		{
			apps[app].login(args);
		}
	}

	logout(timeout=null, url="")
	{
		for(const app in apps)
		{
			apps[app].logout(timeout, url);
		}
	}


	hideAll()
	{
		this.log("hideAll");
		for( const app in apps)
		{
			apps[app].hide();
		}
	}

	view(app, subapp = "")
	{
		this.hideAll();

		this.log("view: "+app);

		if( apps.hasOwnProperty(app) )
		{
			apps[app].load(subapp);
		}

		if( apps.hasOwnProperty(app) && apps[app].loaded )
		{
			apps[app].show();
		} else {
			try
			{
//			this.log("Not loaded? "+ apps[app].loaded);
				this.log("Not loaded? "+ app);
				apps[app].viewonload = true;
				apps["loading"].show();
			}
			catch(err)
			{
				debug_log(apps);
				debug_log(app);
				this.log("Failed with:"+err.message);
			}
		}
	}

	isLoggedIn()
	{
		let res = true;
		for( const app in apps)
		{
			res = res & apps[app].isLoggedIn();
		}
		return res;
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

/*
	debug_log("Read config");
	debug_log("Config App: "+store.get("app"));
	debug_log("Config Frame: "+store.get("frame"));
*/

	//TODO: Move to menu?
	
	// Update menu with user stored app
	if (store.get("app"))
	{
		debug_log("Set menu by app ("+store.get("app")+")");
		// Select element by app-assigned "data-app" attribute
		$(".nav_button[data-app='"+store.get("app")+"']").addClass("active");
	} 
	else 
	{
		// Select element by target frame
		debug_log("Set menu by frame ("+store.get("frame")+")");
		$(".nav_button[target='"+store.get("frame")+"']").addClass("active");	
	}


	mgr.view(WebApp.frameToApp(store.get("frame")), store.get("app"));
}

// Called externally from opiadmin
function login(args) {
	// called when admin UI has verified login, pass the same to the owncloud and roundcube
	debug_log("Login");

	mgr.login(args);
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
		mgr.view("loading");
		logout(timeout,url);
	});
}

function logout(timeout,url)
{
	apps.mail.waitlogout = true;
	apps.nc.waitlogout = true;
	apps.admin.waitlogout = true;
	menu.hide();
	mgr.logout(timeout, url);

/*
	//debug_log("NC token: " + apps.nc.token);
	for(const app in apps)
	{
		apps[app].logout(timeout, url);
	}
*/
}

function set_frame(activeFrame,app="") {
	location.hash = activeFrame;
	debug_log("Update config, current Frame: "+activeFrame+", App: "+app);
	store.set("frame",activeFrame);
	store.set("app", app);

	mgr.view(WebApp.frameToApp(activeFrame), app);
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
	debug_log("Navbutton update: " + app);
	debug_log("NavButton update, id: "+$(app).attr("data-app")+"("+app+")");
	if ($(app).hasClass("active")) {
		// a click on the current active item
		debug_log("Already on the active item.");
	} else {
		if ($(app).attr("data-app")) {
			// This is one of the NC menus
			// Set the subpage of the frame
			debug_log("Page SRC:"+$(app).attr("data-app"));
			debug_log($("#"+$(app).attr("target")).attr("src"));
			mgr.view("nc", $(app).attr("data-app"));
			/*
			if( $("#"+$(app).attr("target")).attr("src").includes("/apps/"+$(app).attr("data-app")) ) {
				debug_log("Already on the active subpage");
			} else {
				$("#"+$(app).attr("target")).attr("src","/nc/index.php/apps/"+$(app).attr("data-app"));
			}
			*/
		}
	}

	$(app).parent().children().removeClass("active");
	$(app).addClass("active");

}

$(document).ready(function() {

	menu = new Menu($("#nav_line"));
	menu.hide();
	
	store = new CookieStorage("opiadmin");
	//store = new LocalStorage("opiadmin");

	if( ! store.has("user") )
	{
		debug_log("Initialize config");
		store.initialize( {
			"user": "",
			"frame": "admin",
			"app": ""
		});
	}

	mgr = new AppManager();
	mgr.loadApps();

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

});
