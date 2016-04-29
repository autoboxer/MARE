(function () {
	'use strict';

	mare.routers.WaitingChildProfiles = Backbone.Router.extend({

		routes: {
			''			: 'loadDefault',
			'gallery'	: 'loadGallery',
			'search'	: 'loadSearch',
			'*other'	: 'loadDefault'
		},

		initialize: function initialize() {
			// Create a promise to resolve once we have permissions for the user (All actions are verified on the server so this won't introduce any risk)
			mare.promises.permissionsLoaded = $.Deferred();
			// Fetch the users permissions
			this.getPermissions();
			// Load the view for the waiting child profiles page as a whole
			mare.views.waitingChildProfiles = mare.views.waitingChildProfiles || new mare.views.WaitingChildProfiles();
		},

		getPermissions: function getPermissions() {
			// Fetch permissions for the current user
			$.ajax({
				dataType: 'json',
				url: '/services/get-gallery-permissions',
				type: 'POST'
			}).done(function(permissions) {
				// Store the permissions on the namespace to allow us to access them in all views and subviews for this page
				mare.permissions.gallery = permissions;
				// Resolve the promise tracking permissions loading
				mare.promises.permissionsLoaded.resolve();

			}).fail(function(err) {
				// TODO: Show an error message if we failed to fetch the permissions
				console.log(err);
			});
		},

		loadGallery: function loadGallery() {
			// Use the view for the waiting child profiles page as a whole to display the correct area
			mare.views.waitingChildProfiles.showGallery();
		},

		loadSearch: function loadSearch() {
			// Use the view for the waiting child profiles page as a whole to display the correct area
			mare.views.waitingChildProfiles.showSearchForm();
		},

		/* 	Handle any poorly formed routes or navigation to the waiting child profiles page without specifying a route by rerouting to the gallery */
		loadDefault: function loadDefault() {
			// Route to the gallery page without triggering Backbone history with 'replace' to prevent the back button from reloading the bad route
			this.navigate( 'gallery', { trigger: true, replace: true } );
		}

	});

})();