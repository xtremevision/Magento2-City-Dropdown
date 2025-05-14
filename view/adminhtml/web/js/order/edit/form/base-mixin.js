define([
    'jquery'
], function ($) {
    'use strict';

    return function (targetWidget) {

        $.widget('mage.mageworxOrderEditorBase', targetWidget, {
            editAction: function (event) {
                var self = event.data.context;

                self.cancel();
                var data = self.getLoadFormParams(),
                    $el = $(self.params.editLinkId);

                $.ajax({
                    url: self.params.loadFormUrl,
                    data: data,
                    type: 'post',
                    dataType: 'json',
                    beforeSend: function () {
                        self.showPreLoader();
                    },
                    success: function (response) {
                        if (!response.error && response.status == true) {
                            var fieldsetParent = $el.parent().parent();
                            fieldsetParent.children(self.params.blockContainerId)
                                .addClass('ordereditor-hidden-fieldset')
                                .hide();
                            fieldsetParent.children(self.params.blockContainerId)
                                .after(
                                    "<div class='" +
                                    self.params.blockContainerId.substring(1) +
                                    " ordereditor-fieldset'></div>"
                                );
                            fieldsetParent.children(".ordereditor-fieldset")
                                .html(response.result);
                            self.hidePreLoader();
                        }
                        $(self.params.blockContainerId).trigger('contentUpdated')
                    },
                    error: function () {
                        self.hidePreLoader();
                    }
                });
                return false;
            }
        });

        return $.mage.mageworxOrderEditorBase; // Return the modified widget constructor
    };
});