<?php

namespace Eadesigndev\RomCity\Plugin;

use Eadesigndev\RomCity\Api\RomCityRepositoryInterface;
use Magento\Checkout\Api\Data\ShippingInformationInterface;
use Magento\Checkout\Model\ShippingInformationManagement;
use Magento\Framework\Api\SearchCriteriaBuilder;


class ShippingInformation
{
    private SearchCriteriaBuilder $searchCriteriaBuilder;
    private RomCityRepositoryInterface $cityRepository;

    public function __construct(
        RomCityRepositoryInterface $cityRepository,
        SearchCriteriaBuilder $searchCriteriaBuilder
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
        $shippingAddress = $addressInformation->getShippingAddress();
        $billingAddress = $addressInformation->getBillingAddress();
        $customValidationFailed = false;


        if ($shippingAddress) {
            $shippingCity = $shippingAddress->getCity();
            $shippingRegionId = $shippingAddress->getRegionId();
            if ($shippingCity && $shippingRegionId && !$this->isCityValid($shippingCity, $shippingRegionId)) {
//                $shippingAddress->setCountryId(null);
                $shippingAddress->setCity(null);
                $customValidationFailed = true;
            }
        }

        if ($billingAddress) {
            $billingCity = $billingAddress->getCity();
            $billingRegionId = $billingAddress->getRegionId();

            $isBillingSameAsShipping = $shippingAddress &&
                $shippingAddress->getCity() === $billingCity &&
                $shippingAddress->getRegionId() === $billingRegionId;

            if ($billingCity && $billingRegionId &&
                (!$isBillingSameAsShipping || $customValidationFailed) &&
                !$this->isCityValid($billingCity, $billingRegionId)
            ) {
                $billingAddress->setCity(null);
//                $billingAddress->setCountryId(null);
            }
        }

        return [$cartId, $addressInformation];
    }

    private function isCityValid(string $city, $regionId): bool
    {
        if (empty($city) || empty($regionId)) {
            return false;
        }

        $searchCriteria = $this->searchCriteriaBuilder
            ->addFilter('region_id', $regionId)
            ->setPageSize(1)
            ->create();

        $regionIsPresent = $this->cityRepository->getList($searchCriteria)->getTotalCount() > 0;
        if (!$regionIsPresent) {
            return true;
        }

        $searchCriteria = $this->searchCriteriaBuilder
            ->addFilter('region_id', $regionId)
            ->addFilter('city', $city)
            ->create();
        $allowedCities = $this->cityRepository->getList($searchCriteria)->getItems();

        return count($allowedCities) > 0;
    }
}
