const keystone	= require( 'keystone' ),
	  Types		= keystone.Field.Types;

// Create model. Additional options allow menu name to be used what auto-generating URLs
var Placement = new keystone.List( 'Placement' );

// Create fields
Placement.add( 'Placement', {

	placementDate: { type: Types.Date, label: 'placement date', format: 'MM/DD/YYYY', utc: true, initial: true },
	
	source: { type: Types.Relationship, label: 'source', ref: 'Source', filters: { isActive: true }, initial: true },
	additionalSources: { type: Types.Relationship, label: 'additional sources', ref: 'Source', filters: { isActive: true }, many: true, initial: true },
	notes: { type: Types.Textarea, label: 'notes', initial: true }

}, 'Child', {

	isUnregisteredChild: { type: Types.Boolean, label: 'unregistered child', initial: true },

	child: { type: Types.Relationship, label: 'child', ref: 'Child', dependsOn: { isUnregisteredChild: false }, initial: true },

	childDetails: {
    	firstName: { type: Types.Text, label: 'first name', dependsOn: { isUnregisteredChild: true }, initial: true },
		lastName: { type: Types.Text, label: 'last name', dependsOn: { isUnregisteredChild: true }, initial: true },
		status: { type: Types.Relationship, label: 'status', ref: 'Child Status', dependsOn: { isUnregisteredChild: true }, initial: true }
    }

}, 'Family', {

	isUnregisteredFamily: { type: Types.Boolean, label: 'unregistered family', initial: true },

	family: { type: Types.Relationship, label: 'family', ref: 'Family', dependsOn: { isUnregisteredFamily: false }, initial: true },

	familyDetails: {
		name: { type: Types.Text, label: 'family name', dependsOn: { isUnregisteredFamily: true }, initial: true },

		agency: { type: Types.Relationship, label: 'family\'s agency', ref: 'Agency', note: 'this will be populated automatically if the family is registered with MARE and nothing has been selected', filters: { isActive: true }, initial: true },
		constellation: { type: Types.Relationship, label: 'constellation', ref: 'Family Constellation', dependsOn: { isUnregisteredFamily: true }, initial: true },
		race: { type: Types.Relationship, label: 'race', ref: 'Race', dependsOn: { isUnregisteredFamily: true }, many: true, initial: true },

		address: {
			street1: { type: Types.Text, label: 'address Line 1', dependsOn: { isUnregisteredFamily: true }, initial: true },
			street2: { type: Types.Text, label: 'address Line 2', dependsOn: { isUnregisteredFamily: true }, initial: true },
			city: { type: Types.Text, label: 'city', dependsOn: { isUnregisteredFamily: true }, initial: true },
			state: { type: Types.Relationship, label: 'state', ref: 'State', dependsOn: { isUnregisteredFamily: true }, initial: true },
			zipCode: { type: Types.Text, label: 'zip code', dependsOn: { isUnregisteredFamily: true }, initial: true },
			country: { type: Types.Text, label: 'country', dependsOn: { isUnregisteredFamily: true }, initial: true },
			region: { type: Types.Relationship, label: 'region', dependsOn: { isUnregisteredFamily: true }, ref: 'Region', initial: true }
		},

		phone: {
			work: { type: Types.Text, label: 'work phone number', dependsOn: { isUnregisteredFamily: true }, initial: true },
			home: { type: Types.Text, label: 'home phone number', dependsOn: { isUnregisteredFamily: true }, initial: true },
			mobile: { type: Types.Text, label: 'mobile phone number', dependsOn: { isUnregisteredFamily: true }, initial: true },
			preferred: { type: Types.Select, label: 'preferred phone', options: 'work, home, mobile', dependsOn: { isUnregisteredFamily: true }, initial: true }
		},

		email: { type: Types.Email, label: 'email address', dependsOn: { isUnregisteredFamily: true }, initial: true }
	}
});

Placement.schema.pre( 'save', function( next ) {
	// populate the family's agency field if it hasn't already been populated
	const agencyPopulated = this.populateAgency();

	agencyPopulated
		// if there was an error populating the agency
		.catch( err => {
			// log the error for debugging purposes
			console.error( err );
		})
		// if the agency was populated successfully
		.then( () => {
			// pass the flow of control out of this function
			next();
		});
});

Placement.schema.methods.populateAgency = function() {

	return new Promise( ( resolve, reject ) => {	
		// if the family is unregistered, an agency has already been selected, or the family is registered by no family is selected
		if( this.isUnregisteredFamily || this.familyDetails.agency || ( !this.isUnregisteredFamily && !this.family ) ) {
			// resolve the promise and prevent the rest of the function from executing
			return resolve();
		// if the family is registered and the agency hasn't already been selected
		} else {
			// populate the family Relationship on the model
			this.populate( 'family', err => {
				// if there was an error populating the family field
				if ( err ) {
					// reject the promise with details of the error, preventing the rest of the function from executing
					return reject( `error populating family field for placement with id ${ this.get( '_id' ) } - ${ err }` );
				}
				// if there were no errors, populate the agency field with the family's social worker's agency
				this.familyDetails.agency = this.family.socialWorkerAgency;
				// resolve the promise
				resolve( this );
			})
		}
	});
};

// Define default columns in the admin interface and register the model
Placement.defaultColumns = 'placementDate, child, family, family.name, source';
Placement.register();