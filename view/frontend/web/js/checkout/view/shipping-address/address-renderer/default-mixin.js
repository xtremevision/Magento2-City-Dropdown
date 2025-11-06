define([
    'mage/url'
], function (url) {
    'use strict';

    return function (target) {
        return target.extend({

            defaults: {
                template: 'Eadesigndev_RomCity/shipping-address/address-renderer/default',
                invalidAddressCitySelect: null
            },

            /**
             * @param {Object} address
             * @return {String}
             */
            getIsValidCity: function (address) {
                return this.address().validAddressCitySelect;
            },

            /**
             * Generates the URL for the customer address edit page.
             * @returns {String}
             */
            getEditAddressUrl: function () {
                return url.build('customer/address/edit/id/' + this.address().customerAddressId);
            }
        });
    };
});
