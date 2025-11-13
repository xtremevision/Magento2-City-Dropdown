define([
    'mage/utils/wrapper'
], function (wrapper) {
    'use strict';
    return function (addressFactory) {
        return wrapper.wrap(addressFactory, function (originalFactory, addressData) {
            var address = originalFactory(addressData),
                extensionAttributes = addressData['extension_attributes'];

            address.extensionAttributes = address.extensionAttributes || {};

            if (extensionAttributes && typeof extensionAttributes === 'object') {
                for (var attribute in extensionAttributes) {
                    if (extensionAttributes.hasOwnProperty(attribute)) {
                        address.extensionAttributes[attribute] = extensionAttributes[attribute];
                    }
                }
            }

            return address;
        });
    };
});
