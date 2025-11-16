<?php
/**
 * Copyright © 2018 EaDesign by Eco Active S.R.L.
 * See LICENSE for license details.
 */

namespace Eadesigndev\RomCity\Controller\Adminhtml\Index;

use Eadesigndev\RomCity\Api\RomCityRepositoryInterface;
use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\View\Result\PageFactory;

class Edit extends Action
{
    const ADMIN_RESOURCE = 'Eadesigndev_RomCity::romcity';

    /**
     * @var PageFactory
     */
    private $resultPageFactory;

    /**
     * @var RomCityRepositoryInterface
     */
    private $romCityRepository;

    public function __construct(
        Context $context,
        PageFactory $resultPageFactory,
        RomCityRepositoryInterface $romCityRepository
    ) {
        parent::__construct($context);
        $this->resultPageFactory = $resultPageFactory;
        $this->romCityRepository = $romCityRepository;
    }

    /**
     * @inheritdoc
     */
    public function execute()
    {
        $entityId = (int)$this->getRequest()->getParam('id');

        if ($entityId) {
            try {
                $city = $this->romCityRepository->getById($entityId);
                if (!$city->getId()) {
                    throw new NoSuchEntityException(__('This city no longer exists.'));
                }
            } catch (\Exception $e) {
                $this->messageManager->addErrorMessage(__('This city no longer exists.'));
                return $this->resultRedirectFactory->create()->setPath('*/*/');
            }
        }

        $resultPage = $this->resultPageFactory->create();
        $resultPage->addBreadcrumb(__('City List'), __('Manage City List'));
        $resultPage->getConfig()->getTitle()->prepend(
            $entityId ? __('Edit City') : __('Add City')
        );

        return $resultPage;
    }

    /**
     * @return bool
     */
    protected function _isAllowed()
    {
        return $this->_authorization->isAllowed(self::ADMIN_RESOURCE);
    }
}
