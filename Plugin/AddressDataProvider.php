<?php
declare(strict_types=1);

namespace Eadesigndev\RomCity\Plugin;

use Eadesigndev\RomCity\Api\RomCityRepositoryInterface;
use Magento\Customer\Api\Data\CustomerInterface;
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
    {
        foreach ($result as &$address) {
            $city = (string)($address['city'] ?? '');
            $regionId = $address['region_id'] ?? null;
            $isValid = $this->isCityValid($city, $regionId);
            $address = $this->applyExtensionAttribute($address, $isValid);
        }

        return $result;
    }

    private function applyExtensionAttribute(array $address, bool $isValid): array
    {
        $extensionAttributes = $address['extension_attributes'] ?? [];

        if (is_object($extensionAttributes) && method_exists($extensionAttributes, 'setValidAddressCitySelect')) {
            $extensionAttributes->setValidAddressCitySelect($isValid);
        } else {
            if (!is_array($extensionAttributes)) {
                $extensionAttributes = [];
            }
            $extensionAttributes['valid_address_city_select'] = $isValid;
        }

        $address['extension_attributes'] = $extensionAttributes;

        return $address;
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
