define([
    'mage/utils/wrapper'
], function (wrapper) {
    'use strict';
    return function (addressFactory) {
        return wrapper.wrap(addressFactory, function (originalFactory, addressData) {
            var address = originalFactory(addressData);
            address.isEditable = function () {
                return true;
            }

            return address;
        });
    };
});