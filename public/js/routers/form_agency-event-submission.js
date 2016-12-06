(function () {
	'use strict';

	mare.routers.Form_AgencyEventSubmission = Backbone.Router.extend({

		initialize: function initialize() {
			// Load the view for the right sidebar
			mare.views.sidebar = mare.views.sidebar || new mare.views.Sidebar();
			// create a view for the agency event submission form
			mare.views.form_agencyEventSubmission = mare.views.form_agencyEventSubmission || new mare.views.Form_AgencyEventSubmission();
		}

	});

}());