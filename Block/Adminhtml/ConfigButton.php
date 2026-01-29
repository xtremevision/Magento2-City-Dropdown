<?php
/**
 * Copyright © 2018 EaDesign by Eco Active S.R.L.
 * See LICENSE for license details.
 */

namespace Eadesigndev\RomCity\Block\Adminhtml;

use Eadesigndev\RomCity\Block\Adminhtml\City\Edit\GenericButton;
use Magento\Framework\View\Element\UiComponent\Control\ButtonProviderInterface;

class ConfigButton extends GenericButton implements ButtonProviderInterface
{
    protected $_backendUrl;

    public function __construct(
        \Magento\Backend\Model\UrlInterface $backendUrl
    ) {

        $this->_backendUrl = $backendUrl;
    }

    /**
     * @inheritdoc
     */
    public function getButtonData()
    {        
        return [
            'label' => __('Go to Import Cities'),
            'on_click' => sprintf("location.href = '%s';", $this->_backendUrl->getUrl('admin/system_config/index')),
            'class' => 'secondary',
            'sort_order' => 10
        ];
    }
}
