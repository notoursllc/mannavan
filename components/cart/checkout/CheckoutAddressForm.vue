<script>
import { stringsAreEqual } from '@/utils/common';
import {
    FigButton,
    FigOverlay,
    FigAddress,
    FigAddressForm,
    FigCompareAddressModal
} from '@notoursllc/figleaf';

const addressFormBase = {
    firstName: null,
    lastName: null,
    streetAddress: null,
    extendedAddress: null,
    countryCodeAlpha2: null,
    city: null,
    state: null,
    postalCode: null
};


export default {
    components: {
        FigButton,
        FigOverlay,
        FigAddress,
        FigAddressForm,
        FigCompareAddressModal
    },

    props: {
        cart: {
            type: Object,
            required: true
        }
    },

    data: function() {
        return {
            loading: false,
            isInvalid: true,
            form: {
                ...addressFormBase,
                email: null,
                phone: null,
                is_gift: false
            },
            original_address: {},
            matched_address: {},
            showMatchedAddress: true,
            validationAttempts: 0
        };
    },

    methods: {
        showCompareModal() {
            this.$refs.address_modal.show();
        },

        hideCompareModal() {
            this.$refs.address_modal.hide();
        },

        onShippingAddressFormInvalid(isInvalid) {
            this.isInvalid = isInvalid;
        },

        setShippingFormFromCart() {
            for(const key in this.form) {
                this.form[key] = (key === 'is_gift' ? this.cart[key] : this.cart[`shipping_${key}`]);
            }
        },

        /**
         * Address validation costs money.
         * This prevents the backend validation of the form values
         * are the same as the cart values.
         * (The cart values will exist if the user goes back to the shipping form, step 1,
         * from a higher step)
         */
        shippingDataNeedsValidation() {
            let needValidation = false;

            ['streetAddress', 'city', 'state', 'postalCode', 'countryCodeAlpha2'].forEach((attr) => {
                if(!stringsAreEqual(
                    this.form[attr],
                    this.cart[`shipping_${attr}`]
                )) {
                    needValidation = true;
                }
            });

            return needValidation;
        },

        async saveShippingForm(validate) {
            try {
                this.loading = true;
                const setAddressData = {
                    validate: (validate === true || validate === false) ? validate : this.shippingDataNeedsValidation()
                };

                const maxValidationAttempts = this.$config.shippingAddressMaxValidationAttempts ? parseInt(this.$config.shippingAddressMaxValidationAttempts) : 10;

                // Force turn off validation if the user has reached their limit
                if(this.validationAttempts >= maxValidationAttempts) {
                    setAddressData.validate = false;
                }

                for(const key in this.form) {
                    const dataKey = key === 'is_gift' ? key : `shipping_${key}`;
                    setAddressData[dataKey] = this.form[key];
                }

                if(setAddressData.validate) {
                    this.validationAttempts++;
                }

                // console.log("MAX VALIDATION ATT CONFIG", maxValidationAttempts);
                // console.log("validationAttempts", this.validationAttempts);
                // console.log("setAddressData", setAddressData);

                const setAddressResponse = await this.$api.cart.shipping.setAddress({
                    id: this.cart.id,
                    ...setAddressData
                });

                /*
                * Process validation errors:
                */

                // https://www.shipengine.com/docs/addresses/validation/#address-status-meanings
                const validationStatus = setAddressResponse.data?.validation_response?.status;
                if(['unverified', 'warning', 'error'].includes(validationStatus)) {
                    this.original_address = setAddressResponse.data.validation_response.original_address;
                    this.matched_address = {};
                    this.showMatchedAddress = false;
                    this.showCompareModal();
                    return;
                }

                // if the status is 'verified' BUT the matched address is not identical
                // to the provided address, then we want to get user acceptance:
                if(validationStatus === 'verified'
                    && setAddressResponse.data?.validation_response?.matched_address
                    && setAddressResponse.data?.validation_response?.original_address) {

                    const diffs = [];

                    [
                        'address_line1',
                        'address_line2',
                        'city_locality',
                        'state_province',
                        'postal_code',
                        'country_code'
                    ].forEach((key) => {
                        if(!stringsAreEqual(
                            setAddressResponse.data.validation_response.matched_address[key],
                            setAddressResponse.data?.validation_response?.original_address[key]
                        )) {
                            diffs.push(key);
                        };
                    });

                    if(diffs.length) {
                        this.original_address = setAddressResponse.data.validation_response.original_address;
                        this.matched_address = setAddressResponse.data.validation_response.matched_address;
                        this.showMatchedAddress = true;
                        this.showCompareModal();
                        return;
                    }
                }

                this.$emit('done', setAddressResponse.data.cart);
            }
            catch(err) {
                console.error('ERR', err);

                this.$figleaf.errorToast({
                    title: this.$t('Error')
                    // text: err.response.data.message
                });

                this.$bugsnag.notify(err);
            }
            finally {
                this.loading = false;
            }
        },

        onUseAddress(selectedAddress) {
            // console.log("ON USE ADDRESS", selectedAddress)

            this.form = {
                ...this.form,
                streetAddress: selectedAddress.addressLine1,
                extendedAddress: selectedAddress.addressLine2,
                countryCodeAlpha2: selectedAddress.country,
                city: selectedAddress.city,
                state: selectedAddress.state,
                postalCode: selectedAddress.zip
            };

            this.saveShippingForm(false);
        }
    },

    watch: {
        cart: {
            handler(newVal) {
                this.setShippingFormFromCart();
            },
            immediate: true
        }
    },
};
</script>

<template>
    <div>
        <fig-overlay :show="loading">
            <fig-address-form
                v-model="form"
                @invalid="onShippingAddressFormInvalid" />

            <div class="mt-4 w-full">
                <fig-button
                    variant="primary"
                    @click="() => { saveShippingForm() }"
                    :disabled="isInvalid">{{ $t('Save & Continue') }}</fig-button>
            </div>
        </fig-overlay>

        <!-- modal for verifying the shipping address -->
        <fig-compare-address-modal
            ref="address_modal"
            :original-line1="original_address.address_line1"
            :original-line2="original_address.address_line2"
            :original-city="original_address.city_locality"
            :original-state="original_address.state_province"
            :original-zip="original_address.postal_code"
            :original-country="original_address.country_code"
            :suggested-line1="matched_address.address_line1"
            :suggested-line2="matched_address.address_line2"
            :suggested-city="matched_address.city_locality"
            :suggested-state="matched_address.state_province"
            :suggested-zip="matched_address.postal_code"
            :suggested-country="matched_address.country_code"
            :show-suggested-address="showMatchedAddress"
            @original="onUseAddress"
            @suggested="onUseAddress" />
    </div>
</template>
