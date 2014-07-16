<?php

        $basedir = realpath(dirname(__FILE__)."/../");

	set_include_path( $basedir."/aux".PATH_SEPARATOR .$basedir."/lib");

	require 'Slim/Slim.php';
	require_once 'rb/rb.php';
	require_once 'Utils.php';
	require 'User.php';
	require 'Groups.php';
	require 'Updates.php';
	require 'Smtp.php';
	require 'Fetchmail.php';
	require 'Backup.php';
	require 'Network.php';

	require_once 'Session.php';
	\OPI\session\setup();


	\Slim\Slim::registerAutoloader();

	$db_path = realpath($basedir."/data"); //die($db_path.'/test.db');
	R::setup('sqlite:'.$db_path.'/test.db');


	$app = new \Slim\Slim(array(
    		'debug' => true
		)
	);

	// Todo: FIX user get own settings

	// Session and authorization
	$app->post(		'/api/session',		"\OPI\session\login");
	$app->get(		'/api/session',		"\OPI\session\loggedin");
	$app->delete(	'/api/session',		"\OPI\session\logout");

	// User functions
	$app->post(	'/api/users', 		"\OPI\session\\requireadmin",		"\OPI\users\createuser");
	$app->post(	'/api/users/:id/changepassword', "\OPI\session\\requireloggedin",	"\OPI\users\updatepassword");
	$app->put(	'/api/users/:id', 	"\OPI\session\\requireloggedin",	"\OPI\users\updateuser");
	$app->get(	'/api/users',		"\OPI\session\\requireadmin",		"\OPI\users\getusers" );
	$app->get(	'/api/users/:id',	"\OPI\session\\requireloggedin",	"\OPI\users\getuser");
	$app->delete(	'/api/users/:id',	"\OPI\session\\requireadmin",		"\OPI\users\deleteuser");
	$app->delete(	'/api/users', 		"\OPI\session\\requireadmin",		"\OPI\users\deleteusers");

	// Group functions
	$app->get(	'/api/groups',			"\OPI\session\\requireadmin",	"\OPI\groups\getgroups" );
	$app->get(	'/api/groups/:name',		"\OPI\session\\requireadmin",	"\OPI\groups\getusers" );
	$app->post(	'/api/groups',			"\OPI\session\\requireadmin",	"\OPI\groups\creategroup" );
	$app->post(	'/api/groups/:name',		"\OPI\session\\requireadmin",	"\OPI\groups\adduser" );
	$app->delete(	'/api/groups',			"\OPI\session\\requireadmin",	"\OPI\groups\deletegroups" );
	$app->delete(	'/api/groups/:name',		"\OPI\session\\requireadmin",	"\OPI\groups\deletegroup" );
	$app->delete(	'/api/groups/:name/:user',	"\OPI\session\\requireadmin",	"\OPI\groups\\removeuser" );

	// Update functions
	$app->get(		'/api/updates',		"\OPI\session\\requireadmin",	"\OPI\updates\getstate");
	$app->post(		'/api/updates',		"\OPI\session\\requireadmin",	"\OPI\updates\setstate");
	$app->put(		'/api/updates',		"\OPI\session\\requireadmin",	"\OPI\updates\setstate");

	// SMTP domains
	$app->get(		'/api/smtp/domains',		"\OPI\session\\requireadmin",	"\OPI\smtp\getdomains");
	$app->post(		'/api/smtp/domains',		"\OPI\session\\requireadmin",	"\OPI\smtp\adddomain");
	$app->delete(	'/api/smtp/domains',		"\OPI\session\\requireadmin",	"\OPI\smtp\deletedomains");
	$app->delete(	'/api/smtp/domains/:id',	"\OPI\session\\requireadmin",	"\OPI\smtp\deletedomain");

	// SMTP Mail-addresses
	$app->post(	'/api/smtp/domains/:name/addresses',	"\OPI\session\\requireadmin",	"\OPI\smtp\addaddress");
	$app->get(	'/api/smtp/domains/:name/addresses',	"\OPI\session\\requireadmin",	"\OPI\smtp\getaddresses");
	$app->delete(	'/api/smtp/domains/:name/addresses',	"\OPI\session\\requireadmin",	"\OPI\smtp\deleteaddresses");
	$app->delete(	'/api/smtp/domains/:name/addresses/:address',	"\OPI\session\\requireadmin",	"\OPI\smtp\deleteaddress");

	// SMTP Settings
	$app->get(		'/api/smtp/settings',		"\OPI\session\\requireadmin",	"\OPI\smtp\getsettings");
	$app->post(		'/api/smtp/settings',		"\OPI\session\\requireadmin",	"\OPI\smtp\setsettings");

	// Fetchmail Settings
	$app->get(		'/api/fetchmail/accounts',		"\OPI\session\\requireloggedin",	"\OPI\\fetchmail\getaccounts");
	$app->get(		'/api/fetchmail/accounts/:id',	"\OPI\session\\requireloggedin",	"\OPI\\fetchmail\getaccount");
	$app->post(		'/api/fetchmail/accounts',		"\OPI\session\\requireloggedin",	"\OPI\\fetchmail\addaccount");
	$app->put(		'/api/fetchmail/accounts/:id',	"\OPI\session\\requireloggedin",	"\OPI\\fetchmail\updateaccount");
	$app->delete(	'/api/fetchmail/accounts/:id',	"\OPI\session\\requireloggedin",	"\OPI\\fetchmail\deleteaccount");
	$app->delete(	'/api/fetchmail/accounts',		"\OPI\session\\requireloggedin",	"\OPI\\fetchmail\deleteaccounts");

	// Backup Settings
	$app->get(		'/api/backup/quota',			"\OPI\session\\requireadmin",	"\OPI\\backup\getquota");
	$app->get(		'/api/backup/status',			"\OPI\session\\requireadmin",	"\OPI\\backup\getstatus");

	$app->post(		'/api/backup/subscriptions',	"\OPI\session\\requireadmin",	"\OPI\\backup\addsubscription");
	$app->get(		'/api/backup/subscriptions',	"\OPI\session\\requireadmin",	"\OPI\\backup\getsubscriptions");
	$app->get(		'/api/backup/subscriptions/:id',"\OPI\session\\requireadmin",	"\OPI\\backup\getsubscription");
	// For debug and test, should not be added in production
	$app->delete(	'/api/backup/subscriptions',	"\OPI\session\\requireadmin",	"\OPI\\backup\deletesubscriptions");
	$app->delete(	'/api/backup/subscriptions/:id',"\OPI\session\\requireadmin",	"\OPI\\backup\deletesubscription");

	$app->get(		'/api/backup/settings',			"\OPI\session\\requireadmin",	"\OPI\\backup\getsettings");
	$app->post(		'/api/backup/settings',			"\OPI\session\\requireadmin",	"\OPI\\backup\setsettings");


	// Network Settings
	$app->get(		'/api/network/settings',		"\OPI\session\\requireadmin",	"\OPI\\network\getsettings");
	$app->post(		'/api/network/settings',		"\OPI\session\\requireadmin",	"\OPI\\network\setsettings");
	$app->get(		'/api/network/ports',           	"\OPI\session\\requireadmin",	"\OPI\\network\getports");
	$app->post(		'/api/network/ports',   		"\OPI\session\\requireadmin",	"\OPI\\network\setports");
	$app->get(		'/api/network/ports/:port',           	"\OPI\session\\requireadmin",	"\OPI\\network\getport");
	$app->put(		'/api/network/ports/:port',   		"\OPI\session\\requireadmin",	"\OPI\\network\setport");


	$app->run();

