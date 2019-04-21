<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { Radio, RadioGroup } from 'element-ui'
import ShippingBillingForm from '@/components/checkout/ShippingBillingForm'

Vue.use(Radio)
Vue.use(RadioGroup)

export default {
    components: {
        ShippingBillingForm
    },

    data: function() {
        return {
            billingFormValid: false,
            isSame: true
        }
    },

    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart',
            billingAttributes: 'shoppingcart/billingAttributes'
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
        emit(isValid) {
            this.$nuxt.$emit('CHECKOUT_BILLING_FORM_VALID', isValid);
        },

        onBillingValid(val) {
            this.billingFormValid = val;
            this.emit(this.billingFormValid);
        },

        onRadioChange() {
            this.billingSameAsShipping = this.isSame;

            // If the same, then we consider this form as valid,
            // otherwise the form is valid if the form component emits a valid response
            if(this.isSame) {
                this.emit(true);
            }
            else {
                this.emit(this.billingFormValid);
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
