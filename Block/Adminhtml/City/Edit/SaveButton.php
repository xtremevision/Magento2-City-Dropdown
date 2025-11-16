<?php
/**
 * Copyright © 2018 EaDesign by Eco Active S.R.L.
 * See LICENSE for license details.
 */

namespace Eadesigndev\RomCity\Block\Adminhtml\City\Edit;

use Magento\Framework\View\Element\UiComponent\Control\ButtonProviderInterface;

class SaveButton extends GenericButton implements ButtonProviderInterface
{
    /**
     * @inheritdoc
     */
    public function getButtonData()
    {
        return [
            'label' => __('Save City'),
            'class' => 'save primary',
            'data_attribute' => [
                'mage-init' => [
                    'buttonAdapter' => [
                        'actions' => [
                            [
                                'targetName' => 'xtea_romcity_form.xtea_romcity_form',
                                'actionName' => 'save',
                                'params' => [true]
                            ]
                        ]
                    ]
                ]
            ],
            'sort_order' => 90
        ];
    }
}
