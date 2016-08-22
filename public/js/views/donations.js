(function () {
	'use strict';

	mare.views.Donations = Backbone.View.extend({

		el: 'body',

		events: {
			'keyup .donations-page__input-group'	: 'handleOtherDonationAmount',
			'click .toggle-button'					: 'toggleButton',
			'click .donate'							: 'donate'
		},

		initialize: function initialize() {

			this.$donationDurationButtonGroup	= $('#donation-duration-button-group');
			this.$donationAmountButtonGroup		= $('#donation-amount-button-group');
			this.$donationAmountInputLabel		= $('.donations__input-label');
			this.$donationAmountInputField		= $('#donation-amount-input');

		},

		toggleButton: function toggleButton(event) {

			var $target			= $(event.currentTarget),
				$buttonGroup	= $target.closest('.donations__button-group');

			this.untoggleButtonGroup($buttonGroup);

			$target.addClass('toggle-button--toggled');

			if($buttonGroup.is('[id=donation-amount-button-group]')) {
				this.clearDonationAmountInput();
			}

			this.checkForRequiredInfo();
		},

		untoggleButtonGroup: function untoggleButtonGroup($buttonGroup) {

			$buttonGroup.find('.toggle-button').removeClass('toggle-button--toggled');

		},

		checkForRequiredInfo: function checkForRequiredInfo() {

			var enableDonateButton = true;

			if(enableDonateButton &&
			   this.$donationDurationButtonGroup.find('.toggle-button--toggled').length === 0) {
				enableDonateButton = false;
			}

			if(enableDonateButton &&
			   this.$donationAmountButtonGroup.find('.toggle-button--toggled').length === 0 &&
			   this.$donationAmountInputField.val().length === 0) {
				enableDonateButton = false;
			}

			if(enableDonateButton) {
				this.enableDonateButton();
			} else {
				this.disableDonateButton();
			}

		},

		handleOtherDonationAmount: function handleOtherDonationAmount() {
			// if the length is great than 0
			if(this.$donationAmountInputField.val().length > 0) {
				// get the previous button group and disable all the buttons
				this.untoggleButtonGroup(this.$donationAmountButtonGroup);
				// create a yellow outline to show it's the selection
				this.$donationAmountInputLabel.addClass('donations__input-label--selected');
				this.$donationAmountInputField.addClass('donations__input-field--selected');
			} else {
				// remove the class that adds the yellow outline
				this.$donationAmountInputLabel.removeClass('donations__input-label--selected');
				this.$donationAmountInputField.removeClass('donations__input-field--selected');
			}

			this.checkForRequiredInfo();
		},

		enableDonateButton: function enableDonateButton() {
			$('.donate-button').removeClass('donate-button--disabled');
		},

		disableDonateButton: function disableDonateButton() {
			$('.donate-button').addClass('donate-button--disabled');
		},

		clearDonationAmountInput: function clearDonationAmountInput() {
			this.$donationAmountInputField.removeClass('donations__input-field--selected').val('');
			this.$donationAmountInputLabel.removeClass('donations__input-label--selected');
		},

		donate: function donate() {

			return false;
		}

	});
}());
