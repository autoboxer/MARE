var keystone = require( 'keystone' );

/* Fetch the child record targeted in the inquiry */
exports.getChild = ( inquiryData, done ) => {  
	// there won't be a child record in general inquiries
	if( inquiryData.inquiryType === 'general inquiry' ) {
		console.log( `general inquiry - no child record to fetch` );
		done();
	}
	// also abort if the child field was never filled out
	if( !inquiryData.childId ) {
		console.log( `missing child field - no child record to fetch` );
		done();
	}
	// for all other inquiry types, get the child record
	keystone.list( 'Child' ).model.findById( inquiryData.childId )
			.populate( 'status' )
			.exec()
			.then( child => {
				// store the child in the inquiryData object
				inquiryData.child = child;
				done();
			}, err => {
				console.log( err );
				done();
			});
};

exports.getChildsSocialWorker = ( inquiryData, done ) => {
	// there won't be a child record to get the social worker from in general inquiries
	if( inquiryData.inquiryType === 'general inquiry' ) {
		console.log( `general inquiry - no child's social worker record to fetch` );
		done();
	}
	// abort if we didn't fetch the child record, meaning we can't get their social worker
	if( !inquiryData.child ) {
		console.log( `mising child data - can't fetch child's social worker` );
		done();
	}
	// use the child data to fetch the child's social worker
	keystone.list( 'Social Worker' ).model.findById( inquiryData.child.adoptionWorker )
			.exec()
			.then( socialWorker => {
				// store the child's social worker in the inquiryData object
				inquiryData.childsSocialWorker = socialWorker;
				done();
			}, err => {
				console.log( err );
				done();
			});  
};

exports.getCSCRegionContacts = ( inquiryData, done ) => {
	// if we didn't fetch the child record, we can't get the CSC contact based on their region
	if( !inquiryData.child ) {
		console.log( `mising child data - can't fetch child's social worker` );
		done();
	}
	// Use the region information in the child record to fetch the CSC region contacts
	keystone.list( 'CSC Region Contact' ).model.find()
			.where( 'region', inquiryData.child.region )
			.populate( 'cscRegionContact' ) // We need the information for the contact, not just their ID
			.exec()
			.then( cscRegionContacts => {
				inquiryData.cscRegionContacts = cscRegionContacts;
				done();
			}, err => {
				console.log( err );
				done();
			});
};

exports.getOnBehalfOfFamily = ( inquiry, inquiryData, done ) => {
	// if this isn't a child inquiry, the user won't be presented with the on behalf of family field
	if( !inquiryData.child ) {
		console.log( `mising child data - no on behalf of family field to populate` );
		done();
	}
	// there won't be a field to populate unless it's a social worker making the inquiry
	if( inquiryData.inquirerType !== 'social worker' ) {
		console.log( `inquirer isn't a social worker - no on behalf of field to fetch` );
		done();
	}
	// if the family isn't in the MARE system
	if( !inquiry.onBehalfOfMAREFamily ) {
		// fetch the contents of the free text field instead of trying to look up an existing model
		inquiryData.onBehalfOfFamily = inquiry.onBehalfOfFamilyText;
		// take note of whether the field was populated
		if( inquiryData.onBehalfOfFamily.length > 0 ) {
			inquiryData.hasOnBehalfOfFamily = true;
			inquiryData.hasOnBehalfOfFamilyText = true;
		}
		done();
	}
	// fetch the family record
	keystone.list( 'Family' ).model.findById( inquiry.onBehalfOfFamily )
			.exec()
			.then( family => {
				// store the family in the inquiryData object
				inquiryData.onBehalfOfFamily = family;
				// take note of whether the on behalf of family record was found
				if( family ) {
					inquiryData.hasOnBehalfOfFamilyModel = true;
					inquiryData.hasOnBehalfOfFamily = true;
				}
				done();
			}, err => {
				console.log( err );
				done();
			});
};

exports.getOnBehalfOfFamilyState = ( inquiryData, done ) => {
	// if the on behalf of family isn't in the MARE system or hasn't been filled out
	if( typeof inquiryData.onBehalfOfFamily !== 'object' ) {
		console.log( `on behalf of family isn't a record in the system - no on behalf of family state field to fetch` );
		done();
	}
	// TODO - CRITICAL: what if the state field is missing?  We need to check all middleware for reliance on non-required fields
	// fetch the family record
	keystone.list( 'State' ).model.findById( inquiryData.onBehalfOfFamily.address.state )
			.exec()
			.then( state => {
				// store the family in the inquiryData object
				inquiryData.onBehalfOfFamilyState = state;
				done();
			}, err => {
				console.log( err );
				done();
			});
};

exports.getAgencyContacts = ( inquiryData, done ) => {
	// if it's not a general inquiry, we shouldn't get the agency contacts
	if( !inquiryData.inquiryType !== 'general inquiry' ) {
		console.log( `not a general inquiry - not fetching agency contacts` );
		done();
	}
	// If a general inquiry has been accepted, we need to send an email to the agency
	keystone.list( 'Agency' ).model.find()
			.where( { _id: { $in: inquiryData.agencyReferralIds } } )
			.exec()
			.then( agencies => {
				inquiryData.agencyContacts = agencies;
				done();
			}, err => {
				console.log( err );
				done();
			});
};

exports.getInquirer = ( inquiryData, done ) => {
	// set the model target depending on which user type made the inquiry
	const userType = inquiryData.inquirerType === 'family' ? 'Family' : 'Social Worker';
	// set the inquirer id based on which user type made the inquiry
	const userId = inquiryData.inquirerType === 'family' ? inquiryData.familyId : inquiryData.socialWorkerId;
	// use the target model type and id to fetch the inquirer record
	keystone.list( userType ).model.findById( userId )
			.exec()
			.then( inquirer => {
				// store the inquirer in the inquiryData object
				inquiryData.inquirer = inquirer;
				done();
			}, err => {
				console.log( err );
				done();
			});
};

exports.getInquirerState = ( inquiryData, done ) => {

	keystone.list( 'State' ).model.findById( inquiryData.inquirer.address.state )
			.exec()
			.then( state => {
				// store the inquirer in the inquiryData object
				inquiryData.inquirerState = state;
				done();
			}, err => {
				console.log( err );
				done();
			});
};

exports.getStaffInquiryContact = ( inquiryData, done ) => {
	// Fetch the list of email targets to find the id of 'general inquiries'
	keystone.list( 'Staff Email Target' ).model.findOne()
			.where( 'staffEmailTarget', 'general inquiries' )
			.exec()
			.then( generalInquiryTargetId => {
				// Fetch the CSC contact designated for general inquiries
				keystone.list( 'Staff Email Contact' ).model.find()
						.where( 'emailTarget', generalInquiryTargetId )
						.populate( 'staffEmailContact' ) // We need the information for the contact, not just their ID
						.exec()
						.then( generalInquiryStaffContact => {
							inquiryData.generalInquiryStaffContact = generalInquiryStaffContact;
							done();
						}, err => {
							console.log( err );
							done();
						});
			}, err => {
				console.log( err );
				done();
			});
};

exports.getSource = ( sourceId, inquiryData, done ) => {

	keystone.list( 'Source' ).model.findOne()
			.where( '_id', sourceId )
			.exec()
			.then( source => {
				inquiryData.source = source.source;
				done();
			}, err => {
				console.log( err );
				done();
			});

};

exports.getMethod = ( methodId, inquiryData, done ) => {

	keystone.list( 'Inquiry Method' ).model.findOne()
			.where( '_id', methodId )
			.exec()
			.then( method => {
				inquiryData.method = method.inquiryMethod;
				done();
			}, err => {
				console.log( err );
				done();
			});
};

exports.getInquiryTakenBy = ( employeeId, inquiryData, done ) => {

	keystone.list( 'Admin' ).model.findOne()
			.where( '_id', employeeId )
			.exec()
			.then( employee => {
				inquiryData.takenBy = employee.name.full;
				done();
			}, err => {
				console.log( err );
				done();
			});
};

exports.setStaffEmail = ( inquiryData, done ) => {
	// if we were able to fetch the CSC region contact based on the child's region
	if( inquiryData.cscRegionContacts ) {
		// loop through the records and extract their email addresses
		for( cscRegionContact of inquiryData.cscRegionContacts ) {
			inquiryData.emailAddressesStaff.push( cscRegionContact.cscRegionContact.email );
		};
	// otherwise, use the email address for the contact set to handle general inquiries
	} else {
		inquiryData.emailAddressesStaff.push( inquiryData.generalInquiryStaffContact );
	}

	done();
};

exports.setInquirerEmail = ( inquiryData, done ) => {
	// if this is a family inquiry and the family was set properly
	if( inquiryData.inquirerType === 'family' && inquiryData.inquirer.contact1 ) {
		// set the inquirer email to that of contact 1 for the family
		inquiryData.emailAddressInquirer.push( inquiryData.inquirer.contact1.email );
	// otherwise, if this is a social worker inquiry and the social worker was set properly
	} else if( inquiryData.inquirerType === 'social worker' && inquiryData.inquirer ) {
		// set the inquirer email to the social worker's email
		inquiryData.emailAddressInquirer.push( inquiryData.inquirer.email );
	}

	done();
};

exports.setSocialWorkerEmail = ( inquiryData, done ) => {
	// if we were able to fetch the child's social worker
	if( inquiryData.childsSocialWorker ) {
		// extract their email address
		inquiryData.emailAddressChildsSocialWorker.push( inquiryData.childsSocialWorker.email );
	}

	done();
};

exports.setAgencyContactEmail = ( inquiryData, done ) => {
	// if we were able to fetch the agency contacts
	if( inquiryData.agencyContacts ) {
		// loop through the records and extract their email addresses
		for( agency of inquiryData.agencyContacts ) {
			inquiryData.emailAddressesAgencyContacts.push( agency.generalInquiryContact );
		};
	}

	done();
};

exports.formatEmailFields = ( inquiryData, done ) => {
	// TODO: see if require( 'moment' ) can be moved to the top of the file and still work in this function
	// format the takenOn date for better display in the email
	// this is needed because requiring moment at the top of the file doesn't expose it here for some reason
	inquiryData.takenOn = require( 'moment' )( this.takenOn ).format( 'dddd MMMM Do, YYYY' );

	done();
}