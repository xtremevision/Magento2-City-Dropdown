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
}
