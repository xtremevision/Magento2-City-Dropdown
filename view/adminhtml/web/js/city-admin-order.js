define([
    'jquery',
    'mage/url'
], function ($, urlBuilder) {
    'use strict';
    return function (config) {
        let eaCitiesJson = {},
            cityInputSelector = "[name*='city']",
            regionIdSelector = "[name*='region_id']",
            billingCitySelector = "[name='order[billing_address][city]']",
            shippingCitySelector = "[name='order[shipping_address][city]']",
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
        var cityInput = $(cityInputSelector),
            cityInputName = cityInput.attr('name'),
            cityInputId = cityInput.attr('id');

        var selectCity = $("<select class='required-entry select admin__control-select' name='" + cityInputName + "' id='" + cityInputId + "'></select>");
        var htmlSelect = '<option value="">Please select city</option>';

        let regionId = $(regionIdSelector).val();
        let shippingAsBilling = $(shippingAsBillingSelector).is(':checked');

        $(document).ready(function () {
            // debugger
            if (regionId) {
                setTimeout(function() {
                    fetchCities(regionId).then(cities => {
                        eaCitiesJson[regionId] = cities;
                        populateCityDropdown(regionId);
                    }).catch(error => {
                        console.error('Error fetching or populating cities:', error);
                    });
                }, 200);
            }

            if (!regionId) {
                var selectedCountry = $(billingCountryIdSelector).val();
                let citiesData = config.directoryData[selectedCountry];
                if (citiesData &&
                    typeof citiesData === 'object' &&
                    Object.keys(citiesData).length > 0

                ) {
                    var cityInput = $(billingCitySelector),
                    cityInputName = $(billingCityTextInputElement).attr('name'),
                    cityInputId = $(billingCityTextInputElement).attr('id');

                    var selectCity = $("<select class='required-entry select admin__control-select' name='" + cityInputName + "' id='" + cityInputId + "'></select>");
                    var htmlSelect = '<option value="">Please select city</option>';

                    selectCity.append(htmlSelect);
                    cityInput.replaceWith(selectCity);
                    let $sameAsBillingCheckbox = jQuery('#order-shipping_same_as_billing');
                    if ($sameAsBillingCheckbox.length === 0 || $sameAsBillingCheckbox.is(':checked')) {
                        cityInputName = $(shippingCityTextInputElement).attr('name'),
                        cityInputId = $(shippingCityTextInputElement).attr('id');
                        var selectCity = $("<select class='required-entry select admin__control-select' disabled name='" + cityInputName + "' id='" + cityInputId + "'></select>");
                        var htmlSelect = '<option value="">Please select city</option>';
                        var cityInput = $(shippingCitySelector);
                        selectCity.append(htmlSelect);
                        cityInput.replaceWith(selectCity);
                    }
                }
            }
        });

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
                        // form_key: window.FORM_KEY,
                        // isAjax: 'true'
                    },
                    // showLoader: true,
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
                    if (addressType === 'billing') {
                        $(billingCityTextInputElement).val('');
                        $(billingCitySelectSelector).replaceWith($(billingCityTextInputElement));
                    } else {
                        $(shippingCityTextInputElement).val('');
                        $(shippingCitySelectSelector).replaceWith($(shippingCityTextInputElement));
                    }
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
                    var selectedCountry = $(billingCountryIdSelector).val();
                    let isShipping = $(this).attr('name') === 'order[shipping_address][region_id]' || $(this).attr('name') === 'shipping_address[region_id]';
                    if (isShipping) {
                        selectedCountry = $(shippingCountryIdSelector).val();
                    }
                    let regionCities = config.directoryData[selectedCountry][regionId].cities;
                    //replace back with inputs if region without cities
                    if (regionCities &&
                        typeof regionCities === 'object' &&
                        Object.keys(regionCities).length == 0
                    ) {
                        $(billingCitySelectSelector).replaceWith(cityInput.filter(function(){
                            return $(this).attr('name') === 'order[billing_address][city]' || $(this).attr('name') === 'billing_address[city]'
                        }));
                        $(billingCitySelectSelector).val('');
                        if (shippingAsBilling || isShipping) {
                            $(shippingCitySelectSelector).replaceWith(cityInput.filter(function(){
                            return $(this).attr('name') === 'order[shipping_address][city]' || $(this).attr('name') === 'shipping_address[city]'
                        }));
                        }
                        return;
                    }
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
            } else {
                $(billingCitySelectSelector).empty().append(htmlSelect);
                $(shippingCitySelectSelector).empty().append(htmlSelect);
            }
        });

        $(document).on('change', billingCountryIdSelector, function () {
            var selectedCountry = $(billingCountryIdSelector).val();
            var selectedRegionId = $(billingRegionIdSelector).val();
            
            if (config.directoryData[selectedCountry] === undefined) {
                $(shippingRegionIdSelector).hide();
                $(shippingRegionSelector).show();
                $(billingCitySelectSelector).replaceWith($(billingCityTextInputElement));
                $(shippingCitySelectSelector).replaceWith($(shippingCityTextInputElement));
                $(billingCitySelector).val('');
            } else {
                // debugger
                $(shippingRegionIdSelector).show();
                $(shippingRegionSelector).hide();
                console.log(!selectedRegionId)
                if (!selectedRegionId) {
                    let citiesData = config.directoryData[selectedCountry];
                        var cityInput = $(billingCitySelector),
                        cityInputName = $(billingCityTextInputElement).attr('name'),
                        cityInputId = $(billingCityTextInputElement).attr('id');

                        var selectCity = $("<select class='required-entry select admin__control-select' name='" + cityInputName + "' id='" + cityInputId + "'></select>");
                        var htmlSelect = '<option value="">Please select city</option>';


                        selectCity.append(htmlSelect);
                        cityInput.replaceWith(selectCity);
                    // }
                } else {
                    populateCityDropdown(selectedRegionId, 'billing');
                }
                
                
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

                var cityInput = $(shippingCityTextInputElement),
                cityInputName = $(shippingCityTextInputElement).attr('name'),
                cityInputId = $(shippingCityTextInputElement).attr('id');

                var selectCity = $("<select class='required-entry select admin__control-select' name='" + cityInputName + "' id='" + cityInputId + "'></select>");
                var htmlSelect = '<option value="">Please select city</option>';

                selectCity.append(htmlSelect);
                cityInput.replaceWith(selectCity);
            }
        });

        $(document).on('change', billingCitySelector, function () {
            // debugger
            if(this.tagName === 'SELECT' && shippingAsBilling === true) {
                var shippingCity = $(shippingCitySelectSelector);
                var billingCityOptions = $(billingCitySelectSelector + ' > option').clone(true);
                shippingCity.empty().append(billingCityOptions);
                var billingCityOptionSelected = $(billingCitySelectSelector).find(":selected").val();
                shippingCity.find('option[value="' + billingCityOptionSelected + '"]').attr('selected', 'selected');
            } else {
                if(this.tagName === 'INPUT' && shippingAsBilling === true) {
                    var shippingCity = $(shippingCitySelector);
                    var billingCityVal = $(billingCitySelector).val();
                    $(shippingCitySelector).val(billingCityVal);
                }
            }
        });

        $(document).ready(function() {
            let billingCitySelect = 'select[name="order\\[billing_address\\]\\[city\\]"], select[name="billing_address\\[city\\]"]';
            $(document).on('change','select[name="order\\[billing_address\\]\\[city\\]"], select[name="billing_address\\[city\\]"]', function() {
                let $shippingCityInput = jQuery('select[name="order\\[shipping_address\\]\\[city\\]"], select[name="shipping_address\\[city\\]"]');
                let $sameAsBillingCheckbox = jQuery('#order-shipping_same_as_billing');
                let billingCityValue = jQuery(this).val();
                
                if ($sameAsBillingCheckbox.length === 0 || $sameAsBillingCheckbox.is(':checked')) {
                    $shippingCityInput.val(billingCityValue);
                }
            });
        })
    };
});
