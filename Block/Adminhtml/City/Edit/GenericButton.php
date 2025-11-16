<?php
/**
 * Copyright © 2018 EaDesign by Eco Active S.R.L.
 * See LICENSE for license details.
 */

namespace Eadesigndev\RomCity\Block\Adminhtml\City\Edit;

use Magento\Backend\Block\Widget\Context;

class GenericButton
{
    /**
     * @var Context
     */
    protected $context;

    public function __construct(Context $context)
    {
        $this->context = $context;
    }

    /**
     * @return int|null
     */
    public function getCityId(): ?int
    {
        $id = $this->context->getRequest()->getParam('entity_id');

        return $id ? (int)$id : null;
    }

    /**
     * @param string $route
     * @param array $params
     * @return string
     */
    public function getUrl($route = '', $params = []): string
    {
        return $this->context->getUrlBuilder()->getUrl($route, $params);
    }
}
