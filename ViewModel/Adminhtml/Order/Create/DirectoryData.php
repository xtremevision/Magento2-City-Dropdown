<?php

declare(strict_types=1);

namespace XtremeVision\ExtendedRomCity\ViewModel\Adminhtml\Order\Create;

use Magento\Directory\Model\RegionProvider;
use Magento\Framework\View\Element\Block\ArgumentInterface;

class DirectoryData implements ArgumentInterface
{
    private RegionProvider $regionProvider;

    public function __construct(
        RegionProvider $regionProvider
    )
    {
        $this->regionProvider = $regionProvider;
    }

    public function getRegionsJson()
    {
        return $this->regionProvider->getRegionJson();
    }
}
