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
            billingRegionSelector = "[name='order[billing_address][region]']",
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

        function getCitiesFromDirectoryData(selectedCountry, regionId) {
            let regionCities = config.directoryData?.[selectedCountry]?.[regionId]?.cities;
            if (regionCities &&
                typeof regionCities === 'object' &&
                Object.keys(regionCities).length !== 0
            ) {
                return regionCities;
            }

            return null;
        }

        function determineSelectedCountry() {
            let selectedCountry = $(billingCountryIdSelector).val();
            let isShipping = $(this).attr('name') === 'order[shipping_address][region_id]' || $(this).attr('name') === 'shipping_address[region_id]';
            if (isShipping) {
                selectedCountry = $(shippingCountryIdSelector).val();
            }

            return selectedCountry;
        }

        $(document).ready(function () {
            // debugger
            if (config.skipPopulateOnLoad === true) {
                return;
            }

            if (regionId) {
                $(regionIdSelector).trigger('change');
            }
        });

        /**
         * Function to fetch cities via AJAX
         * @param {string} regionId
         */
        function fetchCities(regionId) {
            return new Promise((resolve, reject) => {
                let serviceUrl = urlBuilder.build(config.ajaxUrl);
                if(!serviceUrl.includes('isAjax'))
                    serviceUrl = config.ajaxUrl + '?isAjax=1';

                $.ajax({
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
        }

        /**
         * Function to populate the city dropdown
         * @param {string} regionId
         * @param {string} countryId
         * @param addressType
         */
        function populateCityDropdown(regionId, countryId, addressType = '') {
            var region = [],
                cityInput = $(cityInputSelector);

            cityInput.each(function (index, cityInput) {
                cityInput = $(cityInput);
                let cityInputName = cityInput.attr('name'),
                    cityInputId = cityInput.attr('id'),
                    cityInputValue = cityInput.val();

                if (addressType && addressType !== '' && !cityInputName.include(addressType)) {
                    return true;
                }

                region = [];
                let cities = getCitiesFromDirectoryData(countryId, regionId);
                $.each(cities, function (index, value) {
                    region.push(value.name);
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

            let shippingAsBilling = $(shippingAsBillingSelector).is(':checked');
            console.log("shippingAsBilling:", shippingAsBilling);
            if (shippingAsBilling === true) {
                $(shippingCitySelectSelector).attr('disabled', true);
            } else {
                $(shippingCitySelectSelector).attr('disabled', false);
            }
        }

        $(document).on('change', "[name='shipping_same_as_billing']", function () {
            //console.log('shipping region:', $(shippingRegionSelector).val());
            let shippingRegionId = $(shippingRegionIdSelector).val();
            let selectedCountry = determineSelectedCountry();
            if(shippingRegionId)
                populateCityDropdown(shippingRegionId, selectedCountry, 'shipping');
        });

        $(document).on('change', "[name*='region_id']", function () {
            let regionId = $(this).val();
            let shippingAsBilling = $(shippingAsBillingSelector).is(':checked');
            if (regionId) {
                // fetchCities(regionId).then(cities => {
                // eaCitiesJson[regionId] = cities;
                let selectedCountry = determineSelectedCountry();
                let cities = getCitiesFromDirectoryData(selectedCountry, regionId);

                //replace back with inputs if region without cities
                if (!cities) {
                    $(billingCitySelectSelector).replaceWith(cityInput.filter(function(){
                        return $(this).attr('name') === 'order[billing_address][city]' || $(this).attr('name') === 'billing_address[city]'
                    }));
                    $(billingCitySelectSelector).val('');
                    if (shippingAsBilling) {
                        $(shippingCitySelectSelector).replaceWith(cityInput.filter(function(){
                        return $(this).attr('name') === 'order[shipping_address][city]' || $(this).attr('name') === 'shipping_address[city]'
                    }));
                    }
                    return;
                }
                if ($(this).attr('name') === 'order[billing_address][region_id]' || $(this).attr('name') === 'billing_address[region_id]') {
                    if (shippingAsBilling === true) {
                        populateCityDropdown(regionId, selectedCountry);
                    } else {
                        populateCityDropdown(regionId, selectedCountry, 'billing');
                    }
                } else {
                    populateCityDropdown(regionId, selectedCountry, 'shipping');
                }
                // }).catch(error => {
                //     console.error('Error fetching or populating cities:', error);
                // });
            } else {
                $(billingCitySelectSelector).empty().append(htmlSelect);
                $(shippingCitySelectSelector).empty().append(htmlSelect);
            }
        });

        $(document).on('change', billingCountryIdSelector, function () {
            var selectedCountry = $(billingCountryIdSelector).val();
            var selectedRegionId = $(billingRegionIdSelector).val();

            let shippingAsBilling = $(shippingAsBillingSelector).is(':checked');

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
                    populateCityDropdown(selectedRegionId, selectedCountry, 'billing');
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
            let shippingAsBilling = $(shippingAsBillingSelector).is(':checked');

            if(this.tagName === 'SELECT' && shippingAsBilling === true) {
                let shippingCity = $(shippingCitySelectSelector);
                let billingCityOptions = $(billingCitySelectSelector + ' > option').clone(true);
                shippingCity.empty().append(billingCityOptions);
                let billingCityOptionSelected = $(billingCitySelectSelector).find(":selected").val();
                shippingCity.find('option[value="' + billingCityOptionSelected + '"]').attr('selected', 'selected');
            } else {
                if(this.tagName === 'INPUT' && shippingAsBilling === true) {
                    let billingCityVal = $(billingCitySelector).val();
                    $(shippingCitySelector).val(billingCityVal);
                }
            }
        });

        $(document).on('change', '#order-billing_address_customer_address_id', function (event) {
            let data = this.value;
            let addresses = config.addresses;
            let selectedAddress = addresses[data];
            if (selectedAddress) {
                let city = selectedAddress.city;
                let billingCity = $(billingCitySelectSelector);
                billingCity.val(city).change();
            }
        });

        $(document).on('change', '#order-shipping_address_customer_address_id', function (event) {
            let data = this.value;
            let addresses = config.addresses;
            let selectedAddress = addresses[data];
            if (selectedAddress) {
                let city = selectedAddress.city;
                let shippingCity = $(shippingCitySelectSelector);
                shippingCity.val(city).change();
            }
        });

        $(document).ready(function() {
            // debugger
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
