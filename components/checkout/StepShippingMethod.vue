<script>
    import Vue from 'vue'
    import { mapGetters } from 'vuex'
    import { Button, Notification, Loading, Radio } from 'element-ui'
    import forEach from 'lodash.foreach'
    import isObject from 'lodash.isobject'
    import cloneDeep from 'lodash.clonedeep'
    import Promise from 'bluebird';
    import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'
    import ShippoRatesDisplay from '@/components/checkout/ShippoRatesDisplay.vue'

    Vue.use(Button)
    Vue.use(Radio)
    Vue.use(Loading.directive)
    Vue.prototype.$notify = Notification;

    let currentNotification = null;

    export default {
        components: {
            ShippoRatesDisplay
        },

        mixins: [
            shopping_cart_mixin
        ],

        data: function() {
            return {
                shippingRates: [],
                selectedRate: null,
                isLoading: false
            }
        },

        computed: {
            ...mapGetters({
                shippingRateCache: 'shoppingcart/shippingRateCache'
            })
        },

        methods: {
            submitShippingMethodForm: async function() {
                if(!this.selectedRate) {
                    currentNotification = this.$notify({
                        title: this.$t('Please select a shipping method'),
                        message: this.$t('Thanks!'),
                        duration: 0,
                        type: 'error'
                    });
                    return;
                }

                try {
                    this.isLoading = true;

                    const response = await this.setShippingRate(this.selectedRate);
                    this.setCartAndTokenStateFromResponse(response);

                    this.$emit('done', 'shipping-method-step') ;
                    this.isLoading = false;
                }
                catch(err) {
                    currentNotification = this.$notify({
                        title: this.$t('An error occurred'),
                        message: '',
                        duration: 0,
                        type: 'error'
                    });
                    this.isLoading = false;
                }
            },

            fetchShippingRates: async function() {
                try {
                    this.isLoading = true;

                    // Get rates from cache if available.  If not then getting fresh rates.
                    // if(this.shippingRateCache.cache) {
                    //     this.shippingRates = cloneDeep(this.shippingRateCache.cache);
                    //     return;
                    // }

                    this.shippingRates = await this.getShippingRates();
                    // this.$store.dispatch('shoppingcart/SET_SHIPPING_RATES_CACHE', cloneDeep(this.shippingRates));
                }
                catch(err) {
                    let msg = 'We were unable to get shipping rates because of a server error.'

                    currentNotification = this.$notify({
                        title: this.$t('An error occurred'),
                        message: msg,
                        duration: 0,
                        type: 'error'
                    });
                }

                this.isLoading = false;
            }
        },

        created: function() {
            this.fetchShippingRates();
        }
    }
</script>

<template>
    <div>
        <div class="fs24 tac mbl">{{ $t('Shipping method') }}</div>

        <div v-loading="isLoading" class="mtl tac">
            <shippo-rates-display :rates="shippingRates" v-model="selectedRate" />
        </div>

        <div class="ptl tac">
            <div class="inlineBlock">
                <el-button type="success"
                    @click="submitShippingMethodForm"
                    :disabled="!selectedRate"
                    round>{{ $t('CONTINUE TO PAYMENT') }}</el-button>
            </div>
        </div>
    </div>
</template>
