<?php
/**
 * Copyright © 2018 EaDesign by Eco Active S.R.L.
 * See LICENSE for license details.
 */

namespace Eadesigndev\RomCity\Block\Adminhtml\City\Edit;

use Magento\Framework\View\Element\UiComponent\Control\ButtonProviderInterface;

class DeleteButton extends GenericButton implements ButtonProviderInterface
{
    /**
     * @inheritdoc
     */
    public function getButtonData()
    {
        $data = [];
        $cityId = $this->getCityId();

        if ($cityId) {
            $data = [
                'label' => __('Delete'),
                'class' => 'delete',
                'on_click' => sprintf(
                    "deleteConfirm('%s', '%s')",
                    __('Are you sure you want to delete this city?'),
                    $this->getUrl('*/*/delete', ['entity_id' => $cityId])
                ),
                'sort_order' => 20
            ];
        }

        return $data;
    }
}
