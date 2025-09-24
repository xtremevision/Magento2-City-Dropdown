<?php

declare(strict_types=1);

namespace Eadesigndev\RomCity\ViewModel\Adminhtml\Order\Create;

use Magento\Directory\Helper\Data as DirectoryHelper;
use Magento\Framework\View\Element\Block\ArgumentInterface;

class DirectoryData implements ArgumentInterface
{
    private $directoryHelper;

    public function __construct(
        DirectoryHelper $directoryHelper
    )
    {
        $this->directoryHelper = $directoryHelper;
    }

    public function getRegionsJson()
    {
        return $this->directoryHelper->getRegionJson();
    }

    public function getKeyedRegionJson()
    {
        $regions = [];
        $data = $this->getRegionsJson();
        $decoded = json_decode($data);
        unset($decoded->config);
        foreach($decoded as $key => $country)
        {
            foreach($country as $regionId => $c)
            {
                $regions[$key][$c->name] = $regionId;
            }
        }
        return json_encode($regions);
    }
}
