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
             * @return {Boolean}
             */
            getIsValidCity: function () {
                var extensionAttributes = this.address().extensionAttributes || {};

                if (typeof extensionAttributes['valid_address_city_select'] === 'undefined') {
                    return true;
                }

                return extensionAttributes['valid_address_city_select'];
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
