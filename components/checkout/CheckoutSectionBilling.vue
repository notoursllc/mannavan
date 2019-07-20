<script>
import { mapGetters } from 'vuex'


export default {
    components: {
        ShippingBillingForm: () => import('@/components/checkout/ShippingBillingForm')
    },

    data: function() {
        return {
            billingFormValid: false,
            isSame: true
        }
    },

    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart'
        }),

        billingSameAsShipping: {
            get: function() {
                return this.shoppingCart.billingSameAsShipping;
            },
            set: function(newVal) {
                this.$store.dispatch('shoppingcart/ATTRIBUTE_SET', {
                    attribute: 'billingSameAsShipping',
                    value: newVal
                });
            }
        }
    },

    methods: {
        dispatchFormStatus(isValid) {
            this.$store.dispatch('checkout/BILLING_FORM_VALID', isValid);
        },

        onBillingValid(val) {
            this.billingFormValid = val;
            this.dispatchFormStatus(this.billingFormValid);
        },

        onRadioChange() {
            this.billingSameAsShipping = this.isSame;

            // If the same, then we consider this form as valid,
            // otherwise the form is valid if the form component dispatchs a valid response
            if(this.isSame) {
                this.dispatchFormStatus(true);
            }
            else {
                this.dispatchFormStatus(this.billingFormValid);
            }
        }
    },

    created() {
        this.onRadioChange();
    }
}
</script>

<template>
    <div class="g-spec-locked">
        <div class="g-spec-label colorGreen fs20">{{ $t('Billing address') }}</div>
        <div class="g-spec-content">
            <el-radio-group
                v-model="isSame"
                @change="onRadioChange">
                <div class="inlineBlock mrl mbm">
                    <el-radio
                        :label="true"
                        border
                        size="medium">{{ $t('Same as shipping address') }}</el-radio>
                </div>

                <div class="inlineBlock">
                    <el-radio
                        :label="false"
                        border
                        size="medium">{{ $t('Use a different billing address') }}</el-radio>
                </div>
            </el-radio-group>

            <shipping-billing-form
                type="billing"
                v-if="!billingSameAsShipping"
                @valid="onBillingValid"
                class="mtl"></shipping-billing-form>
        </div>
    </div>
</template>
