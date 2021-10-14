var baseurl = "/admin/apps.php";
var DEBUG = true;

const LOG_NONE = 0; // No log output at all
const LOG_DEBUG = 1;
const LOG_INFO = 2;
const LOG_WARN = 3;
const LOG_ERR = 4;

// Default debug log threshold if nothing else set
var DEBUG_LEVEL = LOG_WARN;

function debug_log(msg) {
	if (DEBUG) console.log(msg);
}

// Global objects
var menu;
var nav;
var apps;
var mgr;
var store;

/*
* Levels, debug(0, log), info(1), warn(2), error(3)
*/
class Logger
{
	constructor(logname = "", threshold = DEBUG_LEVEL)
	{
		this.prefix = logname+": ";
		this.threshold = threshold;
	}

	verbose(threshold)
	{
		this.threshold = threshold;
	}

	logname(name)
	{
		this.prefix = name + ": ";
	}

	log(msg, level = LOG_DEBUG)
	{
		if( DEBUG_LEVEL == LOG_NONE )
		{
			return;
		}

		if( this.threshold > level )
		{
			return;
		}

		switch(level)
		{
		case LOG_ERR:
			console.error(this.prefix+msg);
			break;
		case LOG_WARN:
			console.warn(this.prefix+msg);
			break;
		case LOG_INFO:
			console.info(this.prefix+msg);
			break;
		case LOG_DEBUG:
			console.log(this.prefix+msg);
			break;
		default:
			console.error("Unknown debug level: "+level);
		}
	}

	debug(msg)
	{
		this.log(msg, LOG_DEBUG);
	}

	info(msg)
	{
		this.log(msg, LOG_INFO);
	}

	warn(msg)
	{
		this.log(msg, LOG_WARN);
	}

	error(msg)
	{
		this.log(msg, LOG_ERR);
	}

	raw(msg, level = LOG_DEBUG)
	{
		console.log(msg);
	}
}

var log = new Logger("Global");


/*
 * Base class for storage. Store objects as stringified json
 * all keys are prefixed with a "namespace" prefix
 */
class Storage
{
	constructor(prefix, logger = null)
	{
		this.prefix = prefix+"_";
		if( ! logger )
		{
			this.log = new Logger("Storage ("+prefix+")", LOG_ERR);
		}
		else
		{
			this.log = logger;
		}
		this.log.info("Created");
	}

	initialize(obj)
	{
		this.log.info("Initialize");
		for( const key in obj)
		{
			this.log.debug("Key: "+key+" val: "+obj[key]);
			this.set(key,obj[key]);
		}
	}

	doGet(key)
	{
		this.log.error("Missing get implementation");
	}

	doSet(key, value)
	{
		this.log.error("Missing set implementation");
	}

	doHas(key)
	{
		this.log.error("Missing has implementation");
	}

	get(key)
	{
		this.log.debug("Get: "+key);
		return JSON.parse(this.doGet(this.prefix+key));
	}

	set(key, value)
	{
		value = (value === null)?"":value;
		this.log.debug("Set: "+key+" : "+value);
		this.doSet(this.prefix+key, JSON.stringify(value));
	}

	has(key)
	{
		this.log.debug("Has: "+key);
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
			return Cookies.get(key);
		}
		return null;
	}

	doSet(key, value)
	{
		Cookies.set(key, value,{ sameSite:'strict', secure:true});
	}

	doHas(key)
	{
		return !(typeof Cookies.get(key) === "undefined");
	}

}

/*
 * Base class for web-apps
 * wraps an iframe and manage an app running within.
 */
class WebApp
{
	constructor(name, logger = null)
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

		if( ! logger )
		{
			this.log = new Logger("WebApp");
		}
		else
		{
			this.log = logger;
		}

		this.log.info("class created");
	}

	show()
	{
		this.log.debug("Show");
		if( ! this.loaded )
		{
			this.log.info("Show called before page loaded!");
		}
		this.frame.classList.add("z0");
	}

	hide()
	{
		this.log.debug("Hide");
		this.frame.classList.remove("z0");
	}

	// Make sure frame is synchronized with login status
	update()
	{
		this.log.debug("update");
	}

	async login()
	{
		this.log.debug("login");
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
		this.log.debug("logout");
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
		this.log.debug("load (app:"+subapp+")");

		if( !force && this.loaded && this.frame.src != "" )
		{
			let url = new URL(this.frame.src);
			if( url.pathname == this.src )
			{
				this.log.info("Page already loaded");
				return false;
			}
		}

		this.frame.src = this.src;
		return true;
	}

	onload()
	{
		this.log.debug("onload");
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
		// TODO: directly calling manager not very nice
		mgr.onLoaded(WebApp.frameToApp(this.name));
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
		this.loaded = true; // App loaded by html
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
			this.log.info("No token provided");
		}
	}

	update()
	{
		super.update();
		if( this.loggedin && ! this.checkLoggedIn())
		{
			// Out of sync
			this.log.debug("update: forcing reload");
			this.load("");
		}
	}

	load(subapp = "", force = false)
	{
		this.log.debug("load (app:"+subapp+")");

		if( this.loggedin && ! this.checkLoggedIn())
		{
			// We are out of sync
			this.log.info("Out of sync, force reload");
			force = true;
		}

		if( !force && this.loaded && this.frame.src != "" )
		{
			let url = new URL(this.frame.src);
			if( url.pathname == this.src )
			{
				this.log.info("Page already loaded");
				return false;
			}
		}

		this.frame.src = this.src;
		return true;
	}

	async logout()
	{
		this.log.debug("logout");
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
						this.log.debug("logout done");
						this.loggedin = false;
						completed();
					})
				.fail( function( xhr, textStatus, errorThrown )
					{
						this.log.info("logout call failed");
						this.log.info("Request token failed: "+textStatus);
						this.log.info("Err thrown: "+ errorThrown);
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
						this.log.info("retrieve token call failed");
						this.log.info("Request token failed: "+textStatus);
						this.log.info("Err thrown: "+ errorThrown);
						fail();
					});
			});
		return prom;
	}


	async login(args)
	{
		this.log.debug("login");

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
						this.log.debug("login done: "+stat);
						this.loggedin = true;
						completed();
					})
				.fail( function( xhr, textStatus, errorThrown )
					{
						this.log.info("login call failed");
						this.log.info("Request token failed: "+textStatus);
						this.log.info("Err thrown: "+ errorThrown);
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
			log.error("Failed to match request token");
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


	update()
	{
		super.update();
		if( this.loggedin != this.checkLoggedIn() )
		{
			this.load(this.current,true);
		}
	}

	load(sub="", force = false)
	{
		this.log.debug("load: "+sub+" (last: "+this.current+")");

		if( !force && this.current != "" && this.current == sub )
		{
			this.log.info("Page already loaded");
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
						this.log.debug("token request succeded");
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
						this.log.info("Request token failed: "+textStatus);
						this.log.info("Err thrown: "+ errorThrown);
						fail();
					});
			});

		return prom;
	}

	async login(args)
	{
		this.log.debug("login");
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
						this.log.debug("login done");
						this.loggedin = true;
						completed();
					})
				.fail( function( xhr, textStatus, errorThrown )
					{
						this.log.error("Err thrown: "+ errorThrown);
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
		this.log.debug("logout");
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
						this.log.debug("logout done");
						this.loggedin = false;
						completed();
					})
				.fail( function(xhr, textStatus, errorThrown)
					{
						this.log.info("logout failed");
						this.log.info("Err thrown: "+ errorThrown);
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
		this.log.debug("logout");
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
							this.log.debug("logout done");
							this.loggedin = false;
							completed();
						},
						error: function( xhr, stat, error )
						{
							this.waitlogout = false;
							if( xhr.status == 405 )
							{
								this.log.info("ADM already logged out?");
							}
							else
							{
								this.log.info("ADM logout failed: " + error);
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
	constructor(logger = null)
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
		this.inoperation = false; // Are we currently in login/logout operation

		if( !logger )
		{
			this.log = new Logger("AppMGR");
		}
		else
		{
			this.log = logger;
		}
		this.log.info("Constructed");
	}


	_setupStatus()
	{
		this.log.debug("SetupStatus");
		for( const app in apps)
		{
			this.log.debug(app + " : " + apps[app].checkLoggedIn());
			apps[app].loggedin = apps[app].checkLoggedIn();
		}
	}

	startPage()
	{
		location.href = baseurl;
	}

	loadApps(force=false)
	{
		this.log.debug("Load apps");
		apps.mail.load("", force);
		apps.nc.load("", force);
	}

	login(args)
	{
		this.log.debug("Login");
		mgr.view("loading","");
		this.inoperation = true;
		this.args = args;
		for( const app in apps)
		{
			let caller = this;
			apps[app].login(args).then(
				function()
				{
					caller.log.debug("Login completed for: "+app);
					if( caller.isLoggedIn() )
					{
						caller.log.info("All apps logged in");
						caller.inoperation = false;
						caller.update();
						caller.viewCurrent();
						menu.show();
					}
				},
				function()
				{
					caller.log.info("Login failed for: "+app);
				}

			);
		}
	}

	logout()
	{
		this.log.debug("Logout");
		menu.hide();
		this.view("loading");

		this.inoperation = true;
		for(const app in apps)
		{
			let caller = this;
			apps[app].logout().then(
				function()
				{
					caller.log.debug("Logout completed for: "+app);
					if( caller.isLoggedOut() )
					{
						caller.log.info("All apps logged out");
						caller.inoperation = false;
						caller.startPage();
					}
				},
				function()
				{
					caller.log.info("Logout failed for: "+app);
				}

			);
		}
	}

	update()
	{
		this.log.debug("update");
		for( const app in apps)
		{
			apps[app].update();
		}
	}


	hideAll()
	{
		this.log.debug("hideAll");
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
		this.log.debug("view app: "+app+" sub: "+subapp);

		if( this.current_app == app && this.current_subapp == subapp )
		{
			this.log.info("view is current, ignore request");
			return;
		}
		this.current_app = app;
		this.current_subapp = subapp;

		this.hideAll();


		if( ! apps.hasOwnProperty(app) )
		{
			this.log.error("Missing application: "+app);
			this.log.raw(apps);
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
				this.log.info(app + " not yet loaded");
				apps["loading"].show();
			}
			catch(err)
			{
				this.log.error("Failed to setup app "+app+" for load");
				this.log.raw(apps);
				this.log.raw(app);
				this.log.info("Failed with:"+err.message);
			}
		}
	}

	// Callback used by frames to report when they are loaded
	onLoaded(app)
	{
		this.log.debug("onLoaded: "+app+ " oper:" + this.inoperation);
		if( !this.inoperation && this.isLoaded() )
		{
			this._setupStatus();
			if( this.isLoggedIn() )
			{
				menu.show();
				this.viewCurrent();
			}
			else
			{
				this.view("admin");
			}
		}
	}

	isLoaded()
	{
		this.log.debug("isLoaded");
		let res = true;
		for( const app in apps)
		{
			this.log.debug("loaded: " + apps[app].loaded+ " ("+app+")" );
			res = res & apps[app].loaded;
		}
		this.log.debug("isLoaded: "+res);
		return res;
	}

	isLoggedIn()
	{
		this.log.debug("isLoggedIn");
		let res = true;
		for( const app in apps)
		{
			this.log.debug("loggedin: " + apps[app].isLoggedIn() + " ("+app+")");
			res = res & apps[app].isLoggedIn();
		}
		this.log.debug("isLoggedIn: "+res);
		return res;
	}

	isLoggedOut()
	{
		this.log.debug("isLoggedOut");
		let res = true;
		for( const app in apps)
		{
			this.log.debug("loggedout: " + !apps[app].isLoggedIn()+ " ("+app+")");
			res = res & !apps[app].isLoggedIn();
		}
		this.log.debug("isLoggedOut: "+res);
		return res;
	}
}

class Navigation
{
	constructor(app="", subapp = "")
	{
		this.log = new Logger("Nav");
		this.log.info("Created, app: "+app+" sub: "+subapp);
		this.items = {};
		this.currentapp = app;
		this.currentsub = subapp;
		let buttons = $(".nav_button");
		for( let i=0; i< buttons.length; i++)
		{
			let bp = this._parseId(buttons[i]);

			if( this.items.hasOwnProperty(bp[0]) )
			{
				this.items[ bp[0] ][ bp[1] ] = buttons[i];
			}
			else
			{
				this.items[ bp[0] ]= { [bp[1]]:buttons[i] };
			}
		}
	}

	_parseId(item)
	{
		let parts = item.id.split("_");

		if( parts.length == 3)
		{
			return [parts[1],parts[2]];
		}
		else if( parts.length == 2)
		{
			return [parts[1],""];
		}
		this.log.debug("Malformed item: "+item.id);
		return ["",""];
	}

	_deActivate(app, subapp="")
	{
		this.log.debug("deActivate: "+app+" "+subapp);
		if( this.items.hasOwnProperty(app) && this.items[app].hasOwnProperty(subapp) )
		{
			this.items[app][subapp].classList.remove("active");
		}
		else
		{
			this.log.info("No such app/subapp: "+app+" "+subapp);
		}
	}

	activate(app, subapp="")
	{
		if( subapp == null )
		{
			subapp = "";
		}
		this.log.debug("activate: "+app+" "+subapp);

		if( this.currentapp == app && this.currentsub == subapp )
		{
			this.log.debug("No nav change, ignoring request");
			return;
		}

		if( this.currentapp != "" )
		{
			this._deActivate(this.currentapp, this.currentsub);
		}

		if( this.items.hasOwnProperty(app) && this.items[app].hasOwnProperty(subapp) )
		{
			this.items[app][subapp].classList.add("active");
			this.currentapp = app;
			this.currentsub = subapp;
		}
		else
		{
			this.log.info("No such app/subapp: "+app+" "+subapp);
		}
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
		log.debug("Set menu by app ("+store.get("app")+")");
		// Select element by app-assigned "data-app" attribute
		$(".nav_button[data-app='"+store.get("app")+"']").addClass("active");
	}
	else
	{
		// Select element by target frame
		log.debug("Set menu by frame ("+store.get("frame")+")");
		$(".nav_button[target='"+store.get("frame")+"']").addClass("active");
	}
}

// Called externally from opiadmin
function login(args) {
	// called when admin UI has verified login, pass the same to the owncloud and roundcube
	log.info("Login");
	mgr.login(args);
}

// Called externally from opiadmin
function logout()
{
	log.info("External logout");
	mgr.logout();
}

// Called externally from opiadmin, not used anymore
function load_nextframe()
{
	// this function is called from admin UI when it has finished loading.
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

function logout_cancel()
{
	$("#confirm_logout").addClass("hidden");
	$("#confirm_logout_backdrop").addClass("hidden");
	$("#confirm_logout_backdrop").css({ opacity: 0 });
}

function icon_logout()
{
	$("#confirm_logout_backdrop").removeClass("hidden");
	$("#confirm_logout_backdrop").animate({ 'opacity': 0.5 },100, function()
	{
		$("#confirm_logout").removeClass("hidden");
		$("#btn_logout_confirm").focus();
	});
	$("#btn_logout_confirm").click(function()
	{
		$("#confirm_logout").addClass("hidden");
		mgr.logout();
	});
}

function set_frame(activeFrame,app="")
{
	location.hash = activeFrame;
	log.info("Update config, current Frame: "+activeFrame+", App: "+app);
	store.set("frame",activeFrame);
	store.set("app", app);
	nav.activate(WebApp.frameToApp(activeFrame), app);
	mgr.view(WebApp.frameToApp(activeFrame), app);
}


$(document).ready(function()
{
	menu = new Menu($("#nav_line"));
	menu.hide();

	store = new CookieStorage("opiadmin");
	//store = new LocalStorage("opiadmin");

	if( ! store.has("user") )
	{
		log.info("Initialize config");
		store.initialize( {
			"user": "",
			"frame": "admin",
			"app": ""
		});
	}

	nav = new Navigation(WebApp.frameToApp(store.get("frame")), store.get("app"));

	mgr = new AppManager();
	mgr.loadApps();

	setTitle();

	$(".nav_button").click(function() {

		log.debug("Calling setframe from navbutton");
		set_frame(this.getAttribute("target"),this.getAttribute("data-app"));
		menu.close();
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
