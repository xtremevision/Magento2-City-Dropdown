define([
    'mage/utils/wrapper'
], function (wrapper) {
    'use strict';
    return function (addressFactory) {
        return wrapper.wrap(addressFactory, function (originalFactory, addressData) {
            var address = originalFactory(addressData);
            address.validAddressCitySelect = addressData['validAddressCitySelect'];
            return address;
        });
    };
});
