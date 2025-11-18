<?php

namespace Eadesigndev\RomCity\Block\Adminhtml\Order\Create\Billing;

use Magento\Framework\Pricing\PriceCurrencyInterface;
use Eadesigndev\RomCity\Api\RomCityRepositoryInterface;

class Address extends \Magento\Sales\Block\Adminhtml\Order\Create\Billing\Address
{
    public function __construct(
        \Magento\Backend\Block\Template\Context $context,
        \Magento\Backend\Model\Session\Quote $sessionQuote,
        \Magento\Sales\Model\AdminOrder\Create $orderCreate,
        PriceCurrencyInterface $priceCurrency,
        \Magento\Framework\Data\FormFactory $formFactory,
        \Magento\Framework\Reflection\DataObjectProcessor $dataObjectProcessor,
        \Magento\Directory\Helper\Data $directoryHelper,
        \Magento\Framework\Json\EncoderInterface $jsonEncoder,
        \Magento\Customer\Model\Metadata\FormFactory $customerFormFactory,
        \Magento\Customer\Model\Options $options,
        \Magento\Customer\Helper\Address $addressHelper,
        \Magento\Customer\Api\AddressRepositoryInterface $addressService,
        \Magento\Framework\Api\SearchCriteriaBuilder $criteriaBuilder,
        \Magento\Framework\Api\FilterBuilder $filterBuilder,
        \Magento\Customer\Model\Address\Mapper $addressMapper,
        RomCityRepositoryInterface $cityRepository,
        array $data = []
    ){
        parent::__construct(
            $context,
            $sessionQuote,
            $orderCreate,
            $priceCurrency,
            $formFactory,
            $dataObjectProcessor,
            $directoryHelper,
            $jsonEncoder,
            $customerFormFactory,
            $options,
            $addressHelper,
            $addressService,
            $criteriaBuilder,
            $filterBuilder,
            $addressMapper,
            $data
        );

        $this->cityRepository = $cityRepository;
    }

    /**
     * Prepare Form and add elements to form
     *
     * @return $this
     */
    protected function _prepareForm()
    {
        parent::_prepareForm();

        $formValues = $this->getFormValues();
        $countryElement = $this->_form->getElement('country_id');
        $regionIdElement = $this->_form->getElement('region_id');
        $regionId = $regionIdElement->getValue();
        $countryId = $countryElement->getValue();
        $searchCriteria = $this->searchCriteriaBuilder
            ->addFilter('region_id', $regionId)
            ->create();

        $cityValue = $formValues['city'];
        $cityId = null;
        $values = [__('Please select city')];
        if ($regionId) {
            $cities = $this->cityRepository->getList($searchCriteria)->getItems();
            foreach($cities as $city) {
                if ($city->getCity() === $cityValue) {
                    $cityId = $city->getCity();
                }
                $values[$city->getCity()] = $city->getCity();
            }
        }

        $addressForm = $this->_customerFormFactory->create('customer_address', 'adminhtml_customer_address');
        $cityAttribute = $addressForm->getAttribute('city');
        if ($countryId == 'RO') {
            $this->_form = $this->_form->removeField('city');
            foreach($this->_form->getElements() as $fieldset){
                $fieldset->removeField('city');
                $fieldset->addField('city', 'select', [
                    'name' => 'order[billing_address]' . '[' . $cityAttribute->getAttributeCode() . ']',
                    'label' => __($cityAttribute->getStoreLabel()),
                    'class' => $this->getValidationClasses($cityAttribute),
                    'required' => $cityAttribute->isRequired(),
                    'values' => $values,
                    'value' => $cityId
                ], 'region');
            }

        }

        return $this;
    }
}
