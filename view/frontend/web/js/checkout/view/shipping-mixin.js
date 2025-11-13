define([
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/model/address-converter'
], function (quote, addressConverter) {
    'use strict';

    /**
     * Ensure shipping address observable always contains an address object so that downstream
     * Magento logic (and other mixins) can safely access fields such as countryId.
     */
    function ensureShippingAddress() {
        if (!quote.shippingAddress()) {
            quote.shippingAddress(addressConverter.formAddressDataToQuoteAddress({}));
        }
    }

    return function (Component) {
        return Component.extend({
            initialize: function () {
                ensureShippingAddress();

                return this._super();
            },

            validateShippingInformation: function () {
                ensureShippingAddress();

                return this._super();
            }
        });
    };
});
