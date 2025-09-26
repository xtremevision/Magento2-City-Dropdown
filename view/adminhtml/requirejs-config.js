var config = {
    map: {
        "*": {
            "Magento_InventoryInStorePickupSalesAdminUi/order/create/scripts-mixin": "Eadesigndev_RomCity/js/order/create/romcity-scripts-map"
        }
    },
    config: {
        mixins: {
            'MageWorx_OrderEditor/js/order/edit/form/base': {
                'Eadesigndev_RomCity/js/order/edit/form/base-mixin': true
            }
        }
    }
};