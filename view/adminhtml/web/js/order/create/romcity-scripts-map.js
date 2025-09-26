/*
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define(
    [
        'jquery',
        'Eadesigndev_RomCity/js/city-admin-order',
        'mage/url',
        'prototype'
    ],
    function (jQuery, cityAdminOrder2, urlBuilder) {
        'use strict';

        return function () {
            var STORE_PICKUP_METHOD = 'instore_pickup',
                SOURCES_FIELD_SELECTOR = '#shipping_form_pickup_location_source',
                SAME_AS_BILLING_SELECTOR = '#order-shipping_same_as_billing',
                CUSTOMER_SHIPPING_ADDRESS_ID_SELECTOR = '#order-shipping_address_customer_address_id',
                CUSTOMER_ADDRESS_SAVE_IN_ADDRESS_BOOK_SELECTOR = '#order-shipping_address_save_in_address_book',
                IN_STORE_PICKUP_CHECKBOX_SELECTOR = '#s_method_instore_pickup';

            let eaCitiesJson = {},
                cityInputSelector = "[name*='city']",
                regionIdSelector = "[name*='region_id']",
                billingCitySelector = "[name='order[billing_address][city]']",
                shippingCitySelector = "[name='order[shipping_address][city]']",
                shippingAsBillingSelector = "[name='shipping_same_as_billing']",
                billingRegionIdSelector = "[name='order[billing_address][region_id]']",
                billingRegionSelector = "[name='order[billing_address][region]']",
                shippingRegionIdSelector = "[name='order[shipping_address][region_id]']",
                shippingRegionSelector = "[name='order[shipping_address][region]']",
                billingCountryIdSelector = "[name='order[billing_address][country_id]']",
                shippingCountryIdSelector = "[name='order[shipping_address][country_id]']",
                billingCityTextInputElement = jQuery("[name='order[billing_address][city]']"),
                shippingCityTextInputElement = jQuery("[name='order[shipping_address][city]']"),
                billingCitySelectSelector = "select[name*='order[billing_address][city]']",
                shippingCitySelectSelector = "select[name*='order[shipping_address][city]']";
            /**
             * Display sources dropdown field;
             * And vice-versa
             *
             * @param {Boolean} isStorePickup
             */
            function setStorePickupMethod(isStorePickup) {
                var sourcesInput = jQuery(SOURCES_FIELD_SELECTOR),
                    shippingAddressSaveInAddressBook = jQuery(CUSTOMER_ADDRESS_SAVE_IN_ADDRESS_BOOK_SELECTOR);

                if (isStorePickup) {
                    shippingAddressSaveInAddressBook.prop('checked', false);
                    sourcesInput.show();

                    return;
                }
                window.order.disableShippingAddress(jQuery(SAME_AS_BILLING_SELECTOR).prop('checked'));
                sourcesInput.hide();
            }

            /**
             * Verify is store pickup delivery method is checked.
             */
            function isStorePickupSelected() {
                var storePickupCheckbox = jQuery(IN_STORE_PICKUP_CHECKBOX_SELECTOR);

                return storePickupCheckbox.length && storePickupCheckbox.prop('checked');
            }

            window.AdminOrder.prototype.setShippingAsBilling = function (flag) {
                var data,
                    areasToLoad = ['billing_method', 'shipping_address', 'shipping_method', 'totals', 'giftmessage'];

                console.log("called from mixin");              
                console.log(window.order);

                this.disableShippingAddress(flag);
                data = this.serializeData(flag ? this.billingAddressContainer : this.shippingAddressContainer);
                data = data.toObject();
                data['shipping_as_billing'] = flag ? 1 : 0;
                data['reset_shipping'] = 1;
                // set customer_address_id to null for shipping address in order to treat it as new from backend
                // Checkbox(Same As Billing Address) uncheck event
                data['order[shipping_address][customer_address_id]'] = null;
                this.loadArea(areasToLoad, true, data);

                console.log("custom logic follows");
                let shippingRegionIdSelector = "#order-shipping_address_region_id";
                let shippingRegionId = jQuery(shippingRegionIdSelector).val();
                if(shippingRegionId)
                {
                    setTimeout(function() {
                        fetchCities(shippingRegionId).then(cities => {
                            eaCitiesJson[shippingRegionId] = cities;
                            populateCityDropdown(shippingRegionId, 'shipping');
                        }).catch(error => {
                            console.error('Error fetching or populating cities:', error);
                        });
                    }, 200);
                }
            };

        /**
         * Function to fetch cities via AJAX
         * @param {string} regionId
         */
        function fetchCities(regionId) {
            return new Promise((resolve, reject) => {
                let serviceUrl = urlBuilder.build(window.order.ajaxUrl);
                if(!serviceUrl.includes('isAjax'))
                    serviceUrl = window.order.ajaxUrl + '?isAjax=1';

                jQuery.ajax({
                    url: serviceUrl,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        region_id: regionId,
                        form_key: window.FORM_KEY,
                        //isAjax: 1
                    },
                    // showLoader: true,
                    success: function (response) {
                        console.log(response);
                        if (response.success) {
                            resolve(response.cities);
                        } else {
                            reject(response.message);
                        }
                    },
                    error: function (error) {
                        console.log(error);

                        reject(error);
                    }
                });
            });
        };

        /**
         * Function to populate the city dropdown
         * @param {string} regionId
         * @param addressType
         */
        function populateCityDropdown(regionId, addressType = '') {
            var region = [],
                cityInput = jQuery(cityInputSelector);
            
            cityInput.each(function (index, cityInput) {
                cityInput = jQuery(cityInput);
                let cityInputName = cityInput.attr('name'),
                    cityInputId = cityInput.attr('id'),
                    cityInputValue = cityInput.val();
                if (JSON.stringify(eaCitiesJson) === '{}' ) {
                    return;
                }

                if (addressType && !cityInputName.include(addressType)) {
                    return true;
                }

                region = [];
                jQuery.each(eaCitiesJson[regionId], function (index, value) {
                    region.push(value[regionId]);
                });

                if (region.length === 0) {
                    if (addressType === 'billing') {
                        jQuery(billingCityTextInputElement).val('');
                        jQuery(billingCitySelectSelector).replaceWith(jQuery(billingCityTextInputElement));
                    } else {
                        jQuery(shippingCityTextInputElement).val('');
                        jQuery(shippingCitySelectSelector).replaceWith(jQuery(shippingCityTextInputElement));
                    }
                    return;
                }

                var selectCity = jQuery("<select class='required-entry select admin__control-select' name='" + cityInputName + "' id='" + cityInputId + "'></select>");
                var htmlSelect = '<option value="">Please select city</option>';
                var options;

                jQuery.each(region, function (index, value) {
                    if (value === cityInputValue) {
                        options = '<option value="' + value + '" selected>' + value + '</option>';
                    } else {
                        options = '<option value="' + value + '">' + value + '</option>';
                    }
                    htmlSelect += options;
                });
                selectCity.append(htmlSelect);
                cityInput.replaceWith(selectCity);
            });

            let shippingAsBilling = jQuery(shippingAsBillingSelector).is(':checked');
            console.log("shippingAsBilling:", shippingAsBilling);
            if (shippingAsBilling === true) {
                jQuery(shippingCitySelectSelector).attr('disabled', true);
            } else {
                jQuery(shippingCitySelectSelector).attr('disabled', false);
            }
        };
            
            /**
             * Always disable unwanted shipping address fields in case store pickup is selected.
             */
            window.AdminOrder.prototype.disableShippingAddress =
                window.AdminOrder.prototype.disableShippingAddress.wrap(function (proceed, flag) {
                    var shippingAddressId = jQuery(CUSTOMER_SHIPPING_ADDRESS_ID_SELECTOR),
                        theSameAsBillingCheckBox = jQuery(SAME_AS_BILLING_SELECTOR),
                        shippingAddressSaveInAddressBook = jQuery(CUSTOMER_ADDRESS_SAVE_IN_ADDRESS_BOOK_SELECTOR);

                    proceed(flag);

                    if (isStorePickupSelected()) {
                        shippingAddressId.prop('disabled', true);
                        theSameAsBillingCheckBox.prop('disabled', true);
                        shippingAddressSaveInAddressBook.prop('disabled', true);
                    }
                });

            /**
             * Set shipping method override
             *
             * @param {String} method
             */
            window.AdminOrder.prototype.setShippingMethod = function (method) {
                var data = {},
                    areas = [
                        'shipping_method',
                        'totals',
                        'billing_method',
                        'shipping_address'
                    ];

                data['order[shipping_method]'] = method;

                if (method === STORE_PICKUP_METHOD) {
                    data = this.serializeData(this.shippingAddressContainer).toObject();
                    data['order[shipping_method]'] = method;
                    data['shipping_as_billing'] = 0;
                    data['save_in_address_book'] = 0;
                    this.shippingAsBilling = 0;
                    this.saveInAddressBook = 0;
                }

                this.loadArea(areas, true, data).then(
                    function () {
                        setStorePickupMethod(method === STORE_PICKUP_METHOD);
                    }
                );
            };

            /**
             * Replace shipping method area.
             * Restore store pickup shipping method if it was already selected.
             */
            window.AdminOrder.prototype.resetShippingMethod = function () {
                var storePickupCheckbox = jQuery(IN_STORE_PICKUP_CHECKBOX_SELECTOR);

                if (!this.isOnlyVirtualProduct) {
                    /* eslint-disable no-undef */
                    $(this.getAreaId('shipping_method')).update(this.shippingTemplate);

                    if (isStorePickupSelected()) {
                        window.order.setShippingMethod(storePickupCheckbox.val());
                    }
                }
            };
        };
    }
);
