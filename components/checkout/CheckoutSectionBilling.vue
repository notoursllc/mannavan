<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { Checkbox } from 'element-ui'
import ShippingBillingForm from '@/components/checkout/ShippingBillingForm'

Vue.use(Checkbox)

export default {
    components: {
        ShippingBillingForm
    },

    data: function() {
        return {
            separateBillingFormValid: false
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
    }
}
</script>

<template>
    <div class="g-spec-locked">
        <div class="g-spec-label colorGreen fs20">{{ $t('Billing address') }}</div>
        <div class="g-spec-content">
            <el-checkbox v-model="billingSameAsShipping">{{ $t('SAME AS SHIPPING ADDRESS') }}</el-checkbox>

            <shipping-billing-form type="billing"
                                v-if="!billingSameAsShipping"
                                @valid="val => { separateBillingFormValid = val }"
                                class="mtl"></shipping-billing-form>
        </div>
    </div>
</template>
