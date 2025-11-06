<?php
declare(strict_types=1);

namespace Eadesigndev\RomCity\Plugin;

use Eadesigndev\RomCity\Api\RomCityRepositoryInterface;
use Magento\Customer\Api\Data\CustomerInterface;
use Magento\Customer\Model\Address;
use Magento\Customer\Model\Address\CustomerAddressDataProvider;
use Magento\Framework\Api\SearchCriteriaBuilder;

class AddressDataProvider
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
     * @param CustomerAddressDataProvider $subject
     * @param array $result
     * @param CustomerInterface $customer
     * @return array
     */
    public function afterGetAddressDataByCustomer(CustomerAddressDataProvider $subject, array $result, CustomerInterface $customer): array
    {   /** @var Address $address */
        foreach ($result as &$address) {
            $city = $address['city'];
            $regionId = $address['region_id'];
            $address['validAddressCitySelect'] = true;
            if (!$this->isCityValid($city, $regionId)) {
                $address['validAddressCitySelect'] = false;
            }
        }

        return $result;
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
