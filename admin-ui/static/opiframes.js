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

	async login()
	{
		this.log("login");
		this.loggedin = true;
		return Promise.resolve();
	}

	checkLoggedIn()
	{
		return this.loggedin;
	}

	isLoggedIn()
	{
		return this.loggedin;
	}

	async logout()
	{
		this.log("logout");
		this.loggedin = false;
		return Promise.resolve();
	}

	/*
	* Load page into frame
	* Return
	*  - true if page load initiated
	*  - false if current page kept
	*/
	load(subapp = "", force = false)
	{
		this.log("load (app:"+subapp+")");

		if( !force && this.loaded && this.frame.src != "" )
		{
			let url = new URL(this.frame.src);
			if( url.pathname == this.src )
			{
				this.log("Page already loaded");
				return false;
			}
		}

		this.frame.src = this.src;
		return true;
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
		this.loggedin = true; // Have no login
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

	load(subapp = "", force = false)
	{
		this.log("load (app:"+subapp+")");

		if( this.loggedin && ! this.checkLoggedIn())
		{
			// We are out of sync
			this.log("Out of sync, force reload");
			force = true;
		}

		if( !force && this.loaded && this.frame.src != "" )
		{
			let url = new URL(this.frame.src);
			if( url.pathname == this.src )
			{
				this.log("Page already loaded");
				return false;
			}
		}

		this.frame.src = this.src;
		return true;
	}

	async logout()
	{
		this.log("logout");
		let caller = this;
		let prom = new Promise(
			function(completed, fail)
			{
				$.ajax( {
						url: "/mail/?_task=logout&_token="+caller.token,
						context: caller
					})
				.done( function( response, stat, xhr)
					{
						this.log("logout done");
						this.loggedin = false;
						completed();
					})
				.fail( function( xhr, textStatus, errorThrown )
					{
						this.log("logout call failed");
						this.log("Request token failed: "+textStatus);
						this.log("Err thrown: "+ errorThrown);
						fail();
					})
			}
		);

		return prom;
	}

	async getToken()
	{
		let caller = this;
		let prom = new Promise(
			function(completed, fail)
			{
				// Retrieve login token
				$.ajax( {
						url: "/mail/?_task=login",
						context: caller
					})
				.done( function( response, stat, xhr)
					{
						//this.log("retrieve token done");
						let token = RCApp.extractToken(response);

						completed(token);
					})
				.fail( function( xhr, textStatus, errorThrown )
					{
						this.log("retrieve token call failed");
						this.log("Request token failed: "+textStatus);
						this.log("Err thrown: "+ errorThrown);
						fail();
					});
			});
		return prom;
	}


	async login(args)
	{
		this.log("login");

		this.token = await this.getToken();
		//this.log("Got token: "+this.token);

		let caller = this;
		let prom = new Promise(
			function(completed, fail)
			{
				$.ajax( {
					url:	"/mail/?_task=login",
					data: { 
						'_user': args.username,
						'_pass': args.password,
						'_token': caller.token,
						'_task': 'login',
						'_action': 'login',
						'_timezone': '',
						'_url': ''
					},
					context: caller,
					type: "POST"
				})
				.done( function( response, stat, xhr )
					{
						this.log("login done: "+stat);
						debug_log("login done: "+stat);
						//debug_log(xhr);
						//debug_log(response);
						this.loggedin = true;
						completed();
					})
				.fail( function( xhr, textStatus, errorThrown )
					{
						this.log("login call failed");
						this.log("Request token failed: "+textStatus);
						this.log("Err thrown: "+ errorThrown);
						debug_log("login fail: "+textStatus);
						debug_log("Err thrown: "+ errorThrown);
						fail();
					});
			});
		return prom;
	}

	checkLoggedIn()
	{
		if( this.page && this.page.defaultView.rcmail && this.page.defaultView.rcmail.env.hasOwnProperty("user_id") )
		{
			return true;
		}
		return false;
	}

	static extractToken(data) {
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

		let isrc = new URL($(this.page).attr("URL"));
		let ptarr = isrc.pathname.split("/");
		if( ptarr.length > 3 )
		{
			this.current = ptarr[4];
		}
	}

	load(sub="", force = false)
	{
		this.log("load: "+sub+" (last: "+this.current+")");

		if( !force && this.current != "" && this.current == sub )
		{
			this.log("Page already loaded");
			return false;
		}

		this.frame.src = this.src + "/apps/"+sub;
		this.current = sub;
		return true;
	}


	async getToken()
	{
		let caller = this;
		let prom = new Promise(
			function(completed, fail)
			{
				$.ajax( {
						url:	"/nc/index.php/csrftoken",
						headers: { 'OCS-APIRequest': 'true'},
						context: caller,
						type: "GET"
					})
				.done( function( response, stat, xhr )
					{
						this.log("token request succeded");
						if( response.hasOwnProperty("token") )
						{
							completed(response["token"]);
						}
						else
						{
							fail();
						}
					})
				.fail( function( xhr, textStatus, errorThrown )
					{
						this.log("Request token failed: "+textStatus);
						this.log("Err thrown: "+ errorThrown);
						//debug_log(xhr);
						fail();
					});
			});

		return prom;
	}

	async login(args)
	{
		this.log("login");
		let caller = this;
		let prom = new Promise(
			function(completed, fail)
			{
				let nc_args = { user: args.username, password: args.password, requesttoken: caller.token };

				$.ajax( {
						url:	"/nc/index.php/login",
						headers: { 'OCS-APIRequest': 'true'},
						data:	nc_args,
						context: caller,
						type: "POST"
					})
				.done( function( response, stat, xhr )
					{
						this.log("login done");
						this.loggedin = true;
						completed();
					})
				.fail( function( xhr, textStatus, errorThrown )
					{
						//this.log("login failed: "+textStatus);
						this.log("Err thrown: "+ errorThrown);
						//debug_log(xhr);
						fail();
					});
			});


		return prom;
	}

	/* Try figure out if we are logged in */
	checkLoggedIn()
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


	async logout()
	{
		this.log("logout");
		this.token = await this.getToken();

		let logout_url = "/nc/index.php/logout?requesttoken="+encodeURIComponent(this.token);
		//debug_log("URL" + logout_url);

		let caller = this;
		let prom = new Promise(
			function(completed, fail)
			{
				$.ajax(	{
						url: logout_url,
						headers: { 'OCS-APIRequest': 'true'},
						context: caller
					})
				.done( function( response, stat, xhr )
					{
						this.log("logout done");
						this.loggedin = false;
						completed();
					})
				.fail( function(xhr, textStatus, errorThrown)
					{
						this.log("logout failed");
						this.log("Err thrown: "+ errorThrown);
						this.waitlogout = false;
						fail();
					});
			}
		);
		return prom;
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

	checkLoggedIn()
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

	async logout()
	{
		this.log("logout");
		let caller = this;
		let prom = new Promise(
			function(completed, failed)
			{
				$.ajax(
					{
						url: '/admin/index.php/api/session',
						type: 'DELETE',
						context: caller,
						success: function(result, stat)
						{
							this.log("logout done");
							this.loggedin = false;
							completed();
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
							failed();
						}
					});
			}
		);
		return prom;
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

		this.default = "admin";
		this.current_app = "";
		this.current_subapp = "";
		this.args = null;
		this.setupStatus();
		this.log("Constructed");
	}


	setupStatus()
	{
		this.log("SetupStatus");
		for( const app in apps)
		{
			this.log(app + " : " + apps[app].checkLoggedIn());
			apps[app].loggedin = apps[app].checkLoggedIn();
		}
	}

	startPage()
	{
		location.href = baseurl;
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
			let caller = this;
			apps[app].login(args).then(
				function()
				{
					caller.log("Login completed for: "+app);
					if( caller.isLoggedIn() )
					{
						caller.log("All apps logged in");
						caller.viewCurrent();
					}
				},
				function()
				{
					caller.log("Login failed for: "+app);
				}

			);
		}
	}

	logout()
	{
		this.log("Logout");
		for(const app in apps)
		{
			let caller = this;
			apps[app].logout().then(
				function()
				{
					caller.log("Logout completed for: "+app);
					if( caller.isLoggedOut() )
					{
						caller.log("All apps logged out");
						caller.startPage();
					}
				},
				function()
				{
					caller.log("Logout failed for: "+app);
				}

			);
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

	viewCurrent()
	{
		this.view(WebApp.frameToApp(store.get("frame")), store.get("app"));
	}

	view(app, subapp = "")
	{
		this.log("view app: "+app+" sub: "+subapp);

		if( this.current_app == app && this.current_subapp == subapp )
		{
			this.log("view is current, ignore request");
			return;
		}
		this.current_app = app;
		this.current_subapp = subapp;

		this.hideAll();


		if( ! apps.hasOwnProperty(app) )
		{
			console.error("Missing application: "+app);
			debug_log(apps);
			return;
		}

		if( apps[app].load(subapp) )
		{
			// We have a change/reload of page
			apps[app].viewonload = true;
		}

		if( !apps[app].viewonload )
		{
			apps[app].show();
		}
		else
		{
			try
			{
				this.log(app + " not yet loaded");
				apps["loading"].show();
			}
			catch(err)
			{
				console.error("Failed to setup app "+app+" for load");
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
			this.log(app + " : " + apps[app].isLoggedIn());
			res = res & apps[app].isLoggedIn();
		}
		this.log("isLoggedIn: "+res);
		return res;
	}

	isLoggedOut()
	{
		let res = true;
		for( const app in apps)
		{
			this.log(app + " : " + !apps[app].isLoggedIn());
			res = res & !apps[app].isLoggedIn();
		}
		this.log("isLoggedOut: "+res);
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


	//mgr.view(WebApp.frameToApp(store.get("frame")), store.get("app"));
}

// Called externally from opiadmin
function login(args) {
	// called when admin UI has verified login, pass the same to the owncloud and roundcube
	debug_log("Login");
	mgr.view("loading","");
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
		logout();
	});
}

function logout()
{
	menu.hide();
	mgr.logout();
}

function set_frame(activeFrame,app="")
{
	location.hash = activeFrame;
	debug_log("Update config, current Frame: "+activeFrame+", App: "+app);
	store.set("frame",activeFrame);
	store.set("app", app);

	mgr.view(WebApp.frameToApp(activeFrame), app);
}

function setTitle()
{
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

function update_nav(app)
{
	//debug_log("Navbutton update: " + app);
	///debug_log("NavButton update, id: "+$(app).attr("data-app")+"("+app+")");
	if ($(app).hasClass("active")) {
		// a click on the current active item
		debug_log("Already on the active item.");
	} else {
		if ($(app).attr("data-app")) {
			// This is one of the NC menus
			// Set the subpage of the frame
			//debug_log("Page SRC:"+$(app).attr("data-app"));
			//debug_log($("#"+$(app).attr("target")).attr("src"));
			mgr.view("nc", $(app).attr("data-app"));
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
