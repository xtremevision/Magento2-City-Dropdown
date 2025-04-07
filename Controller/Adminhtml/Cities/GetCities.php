<?php

declare(strict_types=1);

namespace Eadesigndev\RomCity\Controller\Adminhtml\Cities;

use Eadesigndev\RomCity\Api\RomCityRepositoryInterface;
use Magento\Backend\App\AbstractAction;
use Magento\Backend\App\Action\Context;
use Magento\Framework\Api\SearchCriteriaBuilder;
use Magento\Framework\App\Action\HttpPostActionInterface;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\App\ResponseInterface;
use Magento\Framework\Controller\ResultInterface;
use Magento\Framework\Exception\NotFoundException;
use Magento\Framework\Controller\Result\JsonFactory;


class GetCities extends AbstractAction implements HttpPostActionInterface
{
    private JsonFactory $resultJsonFactory;
    private RequestInterface $request;
    private RomCityRepositoryInterface $cityRepository;
    private SearchCriteriaBuilder $searchCriteriaBuilder;

    public function __construct(
        JsonFactory                $resultJsonFactory,
        RequestInterface           $request,
        RomCityRepositoryInterface $cityRepository,
        SearchCriteriaBuilder      $searchCriteriaBuilder,
        Context                    $context
    )
    {
        $this->resultJsonFactory = $resultJsonFactory;
        $this->request = $request;
        $this->cityRepository = $cityRepository;
        $this->searchCriteriaBuilder = $searchCriteriaBuilder;
        parent::__construct($context);
    }

    /**
     * Execute action based on request and return result
     *
     * @return ResultInterface|ResponseInterface
     * @throws NotFoundException
     */
    public function execute()
    {
        $result = $this->resultJsonFactory->create();
        $regionId = $this->request->getParam('region_id');
        if (!$regionId) {
            return $result->setData([
                'success' => false,
                'message' => __('Region ID is required.')
            ]);
        }

        $searchCriteria = $this->searchCriteriaBuilder->addFilter('region_id', $regionId)
            ->create();
        $cities = $this->cityRepository->getList($searchCriteria);
        $data = [];
        foreach ($cities->getItems() as $city) {
            $data[] = [$regionId => $city->getCityName()];
        }
        return $result->setData([
            'success' => true,
            'cities' => $data
        ]);
    }

    protected function _isAllowed()
    {
        return true;
    }
}
