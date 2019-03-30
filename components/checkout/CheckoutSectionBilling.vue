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
            billingFormValid: false
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
            // console.log("EMITTING: CHECKOUT_BILLING_FORM_VALID", isValid)
            this.$nuxt.$emit('CHECKOUT_BILLING_FORM_VALID', isValid);
        },

        onBillingValid(val) {
            this.billingFormValid = val;
            this.emit(this.billingFormValid);
        },

        onCheckboxChange() {
            // If the checkbox is checked, then we consider this form as valid,
            // otherwise the form is valid if the form component emits a valid response
            if(this.billingSameAsShipping) {
                this.emit(true);
            }
            else {
                this.emit(this.billingFormValid);
            }
        }
    },

    created() {
        this.onCheckboxChange();
        // this.emit(this.billingFormValid);
    }
}
</script>

<template>
    <div class="g-spec-locked">
        <div class="g-spec-label colorGreen fs20">{{ $t('Billing address') }}</div>
        <div class="g-spec-content">
            <el-checkbox
                v-model="billingSameAsShipping"
                @change="onCheckboxChange">{{ $t('SAME AS SHIPPING ADDRESS') }}</el-checkbox>

            <shipping-billing-form
                type="billing"
                v-if="!billingSameAsShipping"
                @valid="onBillingValid"
                class="mtl"></shipping-billing-form>
        </div>
    </div>
</template>
