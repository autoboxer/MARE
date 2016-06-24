/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone				= require('keystone'),
	middleware				= require('./middleware/middleware'),
	registrationMiddleware	= require('./middleware/register'),
	childService			= require('./middleware/service_child'),
	familyService			= require('./middleware/service_family'),
	permissionsService		= require('./middleware/service_permissions'),
	importRoutes			= keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views')
};

// Create arrays of routes for complicated sub-routing
var eventListRoutes = ['/events/adoption-parties/', '/events/mapp-trainings/', '/events/fundraising-events/', '/events/agency-info-meetings/', '/events/other-trainings/'],
	eventRoutes		= ['/events/adoption-parties/*', '/events/mapp-trainings/*', '/events/fundraising-events/*', '/events/agency-info-meetings/*', '/events/other-trainings/*'];

// Setup Route Bindings
exports = module.exports = function(app) {

	'use strict';

	// Views
	app.get('/'										, routes.views.main);
	app.get('/page/*'								, routes.views.page);
	app.get('/form/*'								, routes.views.form);
	app.get(eventListRoutes							, routes.views.eventList);
	app.get(eventRoutes								, routes.views.event);
	app.get('/events'								, routes.views.eventCategories);
	app.get('/success-stories/*'					, routes.views.successStory);
	app.get('/success-stories'						, routes.views.successStories);
	app.get('/waiting-child-profiles'				, routes.views.waitingChildProfiles);
	app.get('/register'								, routes.views.register);
	app.get('/preferences'							, middleware.requireUser, routes.views.preferences);

	app.post('/register'							, registrationMiddleware.registerUser);

	app.post('/login'								, middleware.login);
	app.get('/logout'								, middleware.logout);

	app.get('/donate'								, routes.views.donate);
	app.post('/charge'								, middleware.charge);
	// Services
	app.post('/services/get-children-data'			, childService.getGalleryData);
	app.post('/services/get-child-details'			, childService.getChildDetails);
	app.post('/services/add-bookmark'				, familyService.addChildBookmark);
	app.post('/services/remove-bookmark'			, familyService.removeChildBookmark);
	app.post('/services/get-gallery-permissions'	, permissionsService.getGalleryPermissions);

	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);

};
