define([
    'jquery',
    'Magento_Checkout/js/model/quote',
    'mage/translate',
    'Magento_Ui/js/modal/alert',
    'underscore'
], function ($, quote, $t, alert, _) {
    'use strict';
    return function (targetComponent) {
        return targetComponent.extend({
            placeOrder: function () {
                let citiesConfig = window.checkoutConfig.cities;
                let shippingAddress = quote.shippingAddress(),
                    billingAddress = quote.billingAddress();

                let cities = JSON.parse(citiesConfig);
                let allowedShippingCities = [];
                if (shippingAddress && shippingAddress.regionId && cities[shippingAddress.regionId]) {
                    allowedShippingCities = cities[shippingAddress.regionId];
                }
                let allowedBillingCities = [];
                if (billingAddress && billingAddress.regionId && cities[billingAddress.regionId]) {
                    allowedBillingCities = cities[billingAddress.regionId];
                }

                let shippingValid = false;
                let billingValid = false;
                if(allowedShippingCities.length > 0)
                {
            	    _.find(allowedShippingCities, function(value) {
                        if (value === shippingAddress.city) {
                                return shippingValid = true;
                        }
            	    })
            	}
            	else
                    shippingValid = true;
            	    
                if(allowedBillingCities.length > 0)
                {
                    _.find(allowedBillingCities, function(value) {
                        if (value === billingAddress.city) {
                            return billingValid = true;
                        }
                    })
                }
                else
                    billingValid = true;

                let invalidShippingCityMessage = '';
                let invalidBillingCityMessage = '';
                if (!quote.isVirtual() && shippingValid === false) {
                    invalidShippingCityMessage = $t('The city "%1" in your current shipping address is not valid. Please update your address before placing the order.')
                        .replace('%1', shippingAddress.city);
                }
                if (billingValid === false) {
                    invalidBillingCityMessage = $t('The city "%1" in your current billing address is not valid. Please update your address before placing the order.')
                        .replace('%1', billingAddress.city);
                }

                let errorMessage = invalidShippingCityMessage + '<br>' + invalidBillingCityMessage;
                if (errorMessage.length > 4) {
                    alert({
                        modalClass: 'cdz-alert-popup',
                        title: $t('Invalid Address'),
                        content: errorMessage
                    });

                    return false; // Stop order placement
                }
                return this._super();
            }
        });
    };
});
