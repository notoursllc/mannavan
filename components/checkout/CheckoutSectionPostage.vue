<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { Radio, RadioGroup } from 'element-ui'

Vue.use(Radio);
Vue.use(RadioGroup);

export default {
    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart'
        }),

        shippingMethod: {
            get: function() {
                return this.$store.state.checkout.shippingMethod;
            },
            set: function(newVal) {
                this.onShippingMethodChange(newVal);
            }
        }
    },

    methods: {
        onShippingMethodChange(val) {
            this.$store.dispatch('checkout/SHIPPING_METHOD', val);
        }
    }
}
</script>

<template>
    <div class="g-spec-locked">
        <div class="g-spec-label colorGreen fs20">{{ $t('Postage') }}</div>
        <div class="g-spec-content">

            <el-radio-group
                v-model="shippingMethod"
                @change="onShippingMethodChange">
                <el-radio
                    label="1"
                    border
                    size="medium">
                    {{ $t('Standard') }}:
                    <div class="inlineBlock mls">
                        {{ $n(shoppingCart.shipping_total, 'currency') }}
                    </div>
                </el-radio>
            </el-radio-group>

        </div>
    </div>
</template>
