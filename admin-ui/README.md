# OPI Admin (frontend)

A asset package which include Grunt management for CSS/SASS and JS. Also FTP deployment.


## Getting Started
1) Open Terminal and locate this folder.
2) Run "npm install" to auto-install packages.
3) Ready to go! Try run "grunt" in same Terminal.

Default task will build js and css, and copy bootstrap include files to 'public' subdirs.

Tip: To watch files when developing, try these commands
grunt watch:js
grunt watch:css

Recommended to use separate Terminal tabs/windows for css and js watch.

# Layout

By default the system redirect from /index.html to /admin/index.html.
This then redirects to apps.php.
apps.php sets up the following frame structure
 * Webadmin
 * Roundcube mail
 * Nextcloud

In addition, it loads a javascript (opiframes.js) that is responsible for navigation between the frames.

## File locations
 * static - holds the default layout files (apps.php, opiframes.js ...)
 * src - holds .sass and .js files that are used for webadmin
 * public
   - webadmin templates, images and libs
   - resulting js-app and css files.
 
