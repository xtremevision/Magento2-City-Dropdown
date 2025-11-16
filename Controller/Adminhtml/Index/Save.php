<?php
/**
 * Copyright © 2018 EaDesign by Eco Active S.R.L.
 * See LICENSE for license details.
 */

namespace Eadesigndev\RomCity\Controller\Adminhtml\Index;

use Eadesigndev\RomCity\Api\RomCityRepositoryInterface;
use Eadesigndev\RomCity\Model\RomCityFactory;
use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\App\Request\DataPersistorInterface;
use Magento\Framework\Exception\NoSuchEntityException;

class Save extends Action
{
    const ADMIN_RESOURCE = 'Eadesigndev_RomCity::romcity';

    private const DATA_PERSISTOR_KEY = 'romcity_city';

    /**
     * @var RomCityRepositoryInterface
     */
    private $romCityRepository;

    /**
     * @var RomCityFactory
     */
    private $romCityFactory;

    /**
     * @var DataPersistorInterface
     */
    private $dataPersistor;

    public function __construct(
        Context $context,
        RomCityRepositoryInterface $romCityRepository,
        RomCityFactory $romCityFactory,
        DataPersistorInterface $dataPersistor
    ) {
        parent::__construct($context);
        $this->romCityRepository = $romCityRepository;
        $this->romCityFactory = $romCityFactory;
        $this->dataPersistor = $dataPersistor;
    }

    /**
     * @inheritdoc
     */
    public function execute()
    {
        $resultRedirect = $this->resultRedirectFactory->create();
        $data = $this->getRequest()->getPostValue();

        if (!$data) {
            return $resultRedirect->setPath('*/*/');
        }

        $entityId = isset($data['entity_id']) ? (int)$data['entity_id'] : null;

        try {
            $city = $this->getCityModel($entityId);
            $city->setData($data);
            $this->romCityRepository->save($city);

            $this->messageManager->addSuccessMessage(__('The city has been saved.'));
            $this->dataPersistor->clear(self::DATA_PERSISTOR_KEY);

            if ($this->getRequest()->getParam('back')) {
                return $resultRedirect->setPath('*/*/edit', ['entity_id' => $city->getId()]);
            }

            return $resultRedirect->setPath('*/*/');
        } catch (\Exception $e) {
            $this->messageManager->addErrorMessage(
                __('An error occurred while saving the city: %1', $e->getMessage())
            );
            $this->dataPersistor->set(self::DATA_PERSISTOR_KEY, $data);
            $redirectParams = $entityId ? ['entity_id' => $entityId] : [];
            return $resultRedirect->setPath('*/*/edit', $redirectParams);
        }
    }

    /**
     * @param int|null $entityId
     * @return \Eadesigndev\RomCity\Api\Data\RomCityInterface
     * @throws \Magento\Framework\Exception\LocalizedException
     */
    private function getCityModel(?int $entityId)
    {
        if ($entityId) {
            $city = $this->romCityRepository->getById($entityId);
            if (!$city->getId()) {
                throw new NoSuchEntityException(__('This city no longer exists.'));
            }
            return $city;
        }

        return $this->romCityFactory->create();
    }

    /**
     * @return bool
     */
    protected function _isAllowed()
    {
        return $this->_authorization->isAllowed(self::ADMIN_RESOURCE);
    }
}
