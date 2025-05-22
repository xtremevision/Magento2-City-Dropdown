<?php

namespace Eadesigndev\RomCity\Plugin;

use Eadesigndev\RomCity\Api\RomCityRepositoryInterface;
use Magento\Checkout\Api\Data\ShippingInformationInterface;
use Magento\Checkout\Model\ShippingInformationManagement;
use Magento\Framework\Api\SearchCriteriaBuilder;
use Magento\Framework\Exception\StateException;

class ShippingInformation
{
    private SearchCriteriaBuilder $searchCriteriaBuilder;
    private RomCityRepositoryInterface $cityRepository;

    public function __construct(
        RomCityRepositoryInterface $cityRepository,
        SearchCriteriaBuilder      $searchCriteriaBuilder
    )
    {
        $this->searchCriteriaBuilder = $searchCriteriaBuilder;
        $this->cityRepository = $cityRepository;
    }

    /**
     * @param ShippingInformationManagement $subject
     * @param int $cartId
     * @param ShippingInformationInterface $addressInformation
     * @return array
     */
    public function beforeSaveAddressInformation(ShippingInformationManagement $subject, $cartId, ShippingInformationInterface $addressInformation): array
    {
        $shippingCity = $addressInformation->getShippingAddress()->getCity();
        $billingCity = $addressInformation->getBillingAddress()->getCity();
        $shippingRegionId = $addressInformation->getShippingAddress()->getRegionId();
        $billingRegionId = $addressInformation->getBillingAddress()->getRegionId();
        $searchCriteria = $this->searchCriteriaBuilder
            ->addFilter('region_id', $shippingRegionId)
            ->addFilter('city', $shippingCity)
            ->create();
        $shippingAllowedCities = $this->cityRepository->getList($searchCriteria)->getItems();
        $searchCriteria = $this->searchCriteriaBuilder
            ->addFilter('region_id', $billingRegionId)
            ->addFilter('city', $billingCity)
            ->create();
        $billingAllowedCities = $this->cityRepository->getList($searchCriteria)->getItems();

        $error = [];
        if (count($shippingAllowedCities) < 1) {
            $error[] = __('The city "%1" in your current shipping address is not valid. Please update your address before placing the order.', $shippingCity);
        }

        if (count($billingAllowedCities) < 1) {
            $error[] = __('The city "%1" in your current billing address is not valid. Please update your address before placing the order.', $billingCity);
        }

        if ($error) {
            throw new StateException(__(implode("\n", $error)));
        }

        return [$cartId, $addressInformation];
    }
}
