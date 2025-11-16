<?php
/**
 * Copyright &copy; Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

namespace Eadesigndev\RomCity\Ui\Component\Cities\Listing\Column;

use Magento\Framework\View\Element\UiComponentFactory;
use Magento\Framework\View\Element\UiComponent\ContextInterface;
use Magento\Framework\UrlInterface;
use Magento\Ui\Component\Listing\Columns\Column;

class Actions extends Column
{
    const EDIT_PATH = 'manage_romcity/index/edit';
    const DELETE_PATH = 'manage_romcity/index/delete';

    /**
     * @var UrlInterface
     */
    protected $_urlBuilder;

    /**
     * @var string
     */
    protected $_editUrl;

    /**
     * Constructor
     *
     * @param ContextInterface $context
     * @param UiComponentFactory $uiComponentFactory
     * @param UrlInterface $urlBuilder
     * @param string $editUrl
     * @param array $components
     * @param array $data
     */
    public function __construct(
        ContextInterface $context,
        UiComponentFactory $uiComponentFactory,
        UrlInterface $urlBuilder,
        $editUrl = '',
        array $components = [],
        array $data = []
    ) {
        $this->_urlBuilder = $urlBuilder;
        $this->_editUrl    = $editUrl;
        parent::__construct($context, $uiComponentFactory, $components, $data);
    }

    /**
     * Prepare Data Source
     *
     * @param array $dataSource
     * @return array
     */
    public function prepareDataSource(array $dataSource)
    {
        if (isset($dataSource['data']['items'])) {
            foreach ($dataSource['data']['items'] as &$item) {
                $name = $this->getData('name');
                if (isset($item['entity_id'])) {
                    $item[$name]['edit']   = [                        
                        'href'  => $this->_urlBuilder->getUrl(self::EDIT_PATH, ['id' => $item['entity_id']]),
                        'label' => __('Edit')
                    ];
                    $item[$name]['delete']   = [                        
                        'href'  => $this->_urlBuilder->getUrl(self::DELETE_PATH, ['id' => $item['entity_id']]),
                        'label' => __('Delete')
                    ];
                }
            }
        }
        return $dataSource;
    }
}
