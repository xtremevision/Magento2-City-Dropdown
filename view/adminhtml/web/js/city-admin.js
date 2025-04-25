define([
    'jquery',
    'uiRegistry',
    'mage/utils/wrapper',
    'mage/template',
    'mage/validation',
    'underscore',
    'Magento_Ui/js/modal/modal',
    'jquery/ui'
], function ($, registry) {
    'use strict';
    return function () {
        let cityInputSelector = "[name='city']",
            regionIdSelector = "[name*='region_id']",
            regionSelector = "[name*='region']",
            countryIdSelector = "[name*='country_id']";

        var string = JSON.stringify($eaCitiesJson),
            obj = JSON.parse(string);
        var modalSelector = '.customer_form_areas_address_address_customer_address_update_modal';
        
        $(document).ready(function () {
            let 
                cityInput = $(cityInputSelector);
            if (cityInput.length > 0) {
                var created = createCitySelect();
                if (!created) {
                    resetRegionAndCity(cityInput);
                }
            }
        });

        $(document).on('change', "[name*='region_id']", function () {
        let cityInput = $(cityInputSelector);
            if (cityInput.length > 1 ) {
                cityInput = cityInput.last();
            }
            createCitySelect();
        });

        $(document).on('change', '#city-select', function() {
            $("[name='city']").val($(this).val()).trigger('change');
        });

        var cityComponentName = 'customer_address_form.customer_address_form.general.city';

        $('body').on('modalopened', modalSelector, function() {
            console.log('Modal opened event detected for:', modalSelector);
            registry.async(cityComponentName)(function (cityComponent) {
                console.log('City UI component is loaded and ready!', cityComponent);
                setTimeout(function() {
                    let cityElement = $('#' + cityComponent.uid);
                    console.log('City jQuery element (via component uid):', cityElement);
                    if (cityElement.length) {
                        createCitySelect();
                    }
                }, 50);
            });

        });

        function createCitySelect() {
            var cityInput = $(cityInputSelector);
            if (cityInput.length > 1 ) {
                cityInput = cityInput.last();
            }
            var selectCity = $("<select class='required-entry select admin__control-select' name='city-select' id='city-select'></select>");
            var region_id = $("[name*='region_id']").val();
            var region = [];
            var cityInputValue = cityInput.val();
            
            if (region_id) {
                $.each(obj, function (index, value) {
                    if (value.region_id == region_id) {
                        region.push(value.city_name);
                    }
                });

                var 
                    htmlSelect = '<option>Please select a city</option>',
                    options;
                    $.each(region, function (index, value) {
                        if ( value == cityInputValue) {
                            options = '<option value="' + value + '" selected>' + value + '</option>';
                        } else {
                            options = '<option value="' + value + '">' + value + '</option>';
                        }
                        htmlSelect += options;
                    });
                    
                selectCity.append(htmlSelect)
                if (!options) {
                    return false;
                }

                if ($('#city-select').length > 0) {
                    $('#city-select').replaceWith(selectCity);
                } else {
                    selectCity.insertAfter(cityInput);
                }
                cityInput.hide();
            } else {
                let regionIdSelect = $(regionIdSelector);
                if (!regionIdSelect.val()) {
                    $(regionSelector).val('');
                    $(regionSelector).val('');
                    $(cityInputSelector).val('');
                    $('#city-select').hide();
                    $(cityInputSelector).show()
                }
            }

            return true;
        };

        function resetRegionAndCity(cityInput) {
            cityInput.show();
            $(regionIdSelector).val('');
            $(regionSelector).val('');
            cityInput.val('');
        }

        $(document).on('change', "[name*='country_id']", function () {
            $(regionIdSelector).val('').trigger('change');
        })
    };
});
