<?php
/**
 * Copyright © 2018 EaDesign by Eco Active S.R.L.
 * See LICENSE for license details.
 */

namespace Eadesigndev\RomCity\Controller\Adminhtml\Index;

use Eadesigndev\RomCity\Api\RomCityRepositoryInterface;
use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;

class Delete extends Action
{
    const ADMIN_RESOURCE = 'Eadesigndev_RomCity::romcity';

    /**
     * @var RomCityRepositoryInterface
     */
    private $romCityRepository;

    public function __construct(
        Context $context,
        RomCityRepositoryInterface $romCityRepository
    ) {
        parent::__construct($context);
        $this->romCityRepository = $romCityRepository;
    }

    /**
     * @inheritdoc
     */
    public function execute()
    {
        $resultRedirect = $this->resultRedirectFactory->create();
        $entityId = (int)$this->getRequest()->getParam('entity_id');

        if (!$entityId) {
            $this->messageManager->addErrorMessage(__('We can\'t find a city to delete.'));
            return $resultRedirect->setPath('*/*/');
        }

        try {
            $this->romCityRepository->deleteById($entityId);
            $this->messageManager->addSuccessMessage(__('The city has been deleted.'));
        } catch (\Exception $e) {
            $this->messageManager->addErrorMessage(
                __('An error occurred while deleting the city: %1', $e->getMessage())
            );
            return $resultRedirect->setPath('*/*/edit', ['entity_id' => $entityId]);
        }

        return $resultRedirect->setPath('*/*/');
    }

    /**
     * @return bool
     */
    protected function _isAllowed()
    {
        return $this->_authorization->isAllowed(self::ADMIN_RESOURCE);
    }
}
