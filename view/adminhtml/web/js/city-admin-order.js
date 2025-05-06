define([
    'jquery',
    'mage/url'
], function ($, urlBuilder) {
    'use strict';
    return function (config) {
        let eaCitiesJson = {},
            cityInputSelector = "[name*='city']",
            regionIdSelector = "[name*='region_id']",
            shippingAsBillingSelector = "[name='shipping_same_as_billing']",
            billingRegionIdSelector = "[name='order[billing_address][region_id]']",
            shippingRegionIdSelector = "[name='order[shipping_address][region_id]']",
            shippingRegionSelector = "[name='order[shipping_address][region]']",
            billingCountryIdSelector = "[name='order[billing_address][country_id]']",
            shippingCountryIdSelector = "[name='order[shipping_address][country_id]']",
            billingCityTextInputElement = $("[name='order[billing_address][city]']"),
            shippingCityTextInputElement = $("[name='order[shipping_address][city]']"),
            billingCitySelectSelector = "select[name*='order[billing_address][city]']",
            shippingCitySelectSelector = "select[name*='order[shipping_address][city]']";

        
        if (!config.nameSelectorContainsOrder) {
            billingCountryIdSelector = "[name*='billing_address[country_id]']";
            shippingCountryIdSelector = "[name*='shipping_address[country_id]']";   
            billingRegionIdSelector = "[name*='billing_address[region_id]']";
            shippingRegionIdSelector = "[name*='shipping_address[region_id]']";
            billingCitySelectSelector = "select[name*='billing_address[city]']";
            shippingCitySelectSelector = "select[name*='shipping_address[city]']";
            billingCityTextInputElement = $("[name='billing_address[city]']");
            shippingCityTextInputElement = $("[name='shipping_address[city]']");

        }
        let regionId = $(regionIdSelector).val();
        let shippingAsBilling = $(shippingAsBillingSelector).is(':checked');
        if (regionId) {
            fetchCities(regionId).then(cities => {
                eaCitiesJson[regionId] = cities;
                populateCityDropdown(regionId);
            }).catch(error => {
                console.error('Error fetching or populating cities:', error);
            });
        }

        /**
         * Function to fetch cities via AJAX
         * @param {string} regionId
         */
        function fetchCities(regionId) {
            return new Promise((resolve, reject) => {
                const serviceUrl = urlBuilder.build(config.ajaxUrl);
                $.ajax({
                    url: serviceUrl,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        region_id: regionId,
                    },
                    showLoader: true,
                    success: function (response) {
                        if (response.success) {
                            resolve(response.cities);
                        } else {
                            reject(response.message);
                        }
                    },
                    error: function (error) {
                        reject(error);
                    }
                });
            });
        }

        /**
         * Function to populate the city dropdown
         * @param {string} regionId
         * @param addressType
         */
        function populateCityDropdown(regionId, addressType = '') {
            var region = [],
                cityInput = $(cityInputSelector);

            cityInput.each(function (index, cityInput) {
                cityInput = $(cityInput);
                let cityInputName = cityInput.attr('name'),
                    cityInputId = cityInput.attr('id'),
                    cityInputValue = cityInput.val();
                if (JSON.stringify(eaCitiesJson) === '{}' ) {
                    return;
                }

                if (addressType && !cityInputName.include(addressType)) {
                    return true;
                }

                $.each(eaCitiesJson[regionId], function (index, value) {
                    region.push(value[regionId]);
                });

                if (region.length === 0) {
                    return;
                }

                var selectCity = $("<select class='required-entry select admin__control-select' name='" + cityInputName + "' id='" + cityInputId + "'></select>");
                var htmlSelect = '<option value="">Please select city</option>';
                var options;

                $.each(region, function (index, value) {
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

            if (shippingAsBilling === true) {
                $(shippingCitySelectSelector).attr('disabled', true);
            } else {
                $(shippingCitySelectSelector).attr('disabled', false);
            }
        }


        $(document).on('change', "[name*='region_id']", function () {
            let regionId = $(this).val();
            if (regionId) {
                fetchCities(regionId).then(cities => {
                    eaCitiesJson[regionId] = cities;

                    if ($(this).attr('name') === 'order[billing_address][region_id]' || $(this).attr('name') === 'billing_address[region_id]') {
                        if (shippingAsBilling === true) {
                            populateCityDropdown(regionId);
                        } else {
                            populateCityDropdown(regionId, 'billing');
                        }
                    } else {
                        populateCityDropdown(regionId, 'shipping');
                    }
                }).catch(error => {
                    console.error('Error fetching or populating cities:', error);
                });
            }
        });

        $(document).on('change', billingCountryIdSelector, function () {
            var selectedCountry = $(billingCountryIdSelector).val();
            if (config.directoryData[selectedCountry] === undefined) {
                $(shippingRegionIdSelector).hide();
                $(shippingRegionSelector).show();
                $(billingCitySelectSelector).replaceWith($(billingCityTextInputElement));
                $(shippingCitySelectSelector).replaceWith($(shippingCityTextInputElement));
            } else {
                $(shippingRegionIdSelector).show();
                $(shippingRegionSelector).hide();
            }
            if($(billingRegionIdSelector).prop('tagName') === 'SELECT' && shippingAsBilling === true) {
                var shippingRegionId = $(shippingRegionIdSelector);
                var billingRegionOptions = $(billingRegionIdSelector + ' > option').clone();
                shippingRegionId.empty().append(billingRegionOptions);
            }
        });

        $(document).on('change', shippingCountryIdSelector, function () {
            var selectedCountry = $(shippingCountryIdSelector).val();
            if (config.directoryData[selectedCountry] === undefined) {
                $(shippingRegionIdSelector).hide();
                $(shippingCitySelectSelector).replaceWith($(shippingCityTextInputElement));
            } else {
                $(shippingRegionIdSelector).show();
                $(shippingRegionSelector).hide();
            }
        });

        $(document).on('change', billingCityTextInputElement, function () {
            if(this.tagName === 'SELECT' && shippingAsBilling === true) {
                var shippingCity = $(shippingCitySelectSelector);
                var billingCityOptions = $(billingCitySelectSelector + ' > option').clone(true);
                shippingCity.empty().append(billingCityOptions);
                var billingCityOptionSelected = $(billingCitySelectSelector).find(":selected").val();
                shippingCity.find('option[value="' + billingCityOptionSelected + '"]').attr('selected', 'selected');
            }
        });
    };
});
