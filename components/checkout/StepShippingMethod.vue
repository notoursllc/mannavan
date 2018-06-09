<script>
    import Vue from 'vue'
    import { mapGetters } from 'vuex'
    import { Button, Notification, Loading, Radio } from 'element-ui'
    import forEach from 'lodash.foreach'
    import isObject from 'lodash.isobject'
    import cloneDeep from 'lodash.clonedeep'
    import Promise from 'bluebird';
    import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'

    Vue.use(Button)
    Vue.use(Radio)
    Vue.use(Loading.directive)
    Vue.prototype.$notify = Notification;

    let currentNotification = null;

    export default {
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
                shoppingCart: 'shoppingcart/cart',
                shippingRateCache: 'shoppingcart/shippingRateCache'
            })
        },

        methods: {
            submitShippingMethodForm: async function() {
                let r = null;

                forEach(this.shippingRates, (rate) => {
                    if(rate.rate_id === this.selectedRate) {
                        r = rate;
                    }
                });

                if(!r) {
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

                    const shoppingCart = await this.setShippingRate(r);
                    await this.$store.dispatch('shoppingcart/CART_SET', shoppingCart);

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
                    if(this.shippingRateCache.cache) {
                        return this.shippingRateCache.cache;
                    }

                    const result = await this.getShippingRates({
                        validate_address: 'no_validation',
                        ship_to: {
                            address_line1: this.shoppingCart.shipping_streetAddress,
                            city_locality: this.shoppingCart.shipping_city,
                            state_province: this.shoppingCart.shipping_state,
                            postal_code: this.shoppingCart.shipping_postalCode,
                            country_code: this.shoppingCart.shipping_countryCodeAlpha2
                        },
                        packages: [
                            {
                                weight: {
                                    value: this.shoppingCart.product_weight_total,
                                    unit: 'ounce'
                                }
                            }
                        ]
                    });

                    this.$store.dispatch('shoppingcart/SET_SHIPPING_RATES_CACHE', result);
                    return result;
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
            },

            processShippingRates: async function() {
                try {
                    this.isLoading = true;

                    // Get rates from cache if available.  If not then getting fresh rates.
                    // Then pre-selecting either the previously selected rate or the lowest rate
                    // returned from the API response
                    const result = await this.fetchShippingRates();
                    let lowestRate = null;
                    let lowestId = null;
                    let allRateIds = [];

                    forEach(result, (rate) => {
                        if(!lowestRate || (rate.shipping_amount.amount < lowestRate)) {
                            lowestRate = rate.shipping_amount.amount;
                            lowestId = rate.rate_id;
                            allRateIds.push(rate.shipping_amount.rate_id);
                        }
                    });

                    if(isObject(this.shoppingCart)
                        && isObject(this.shoppingCart.shipping_rate)
                        && allRateIds.indexOf(this.shoppingCart.shipping_rate.rate_id) > -1) {
                        this.selectedRate = this.shoppingCart.shipping_rate.rate_id;
                    }
                    else {
                        this.selectedRate = lowestId;
                    }

                    this.shippingRates = result;
                    this.isLoading = false;
                }
                catch(err) {
                    this.isLoading = false;

                    currentNotification = this.$notify({
                        title: this.$t('An error occurred'),
                        message: err,
                        duration: 0,
                        type: 'error'
                    });
                }
            }
        },

        created: function() {
            this.processShippingRates();
        }
    }
</script>

<template>
    <div>
        <div class="fs24 tac mbl">{{ $t('Shipping method') }}</div>

        <div v-loading="isLoading" class="mtl tac">
            <div class="inlineBlock">
                <div v-for="rate in shippingRates" :key="rate.rate_id" class="displayTableRow">
                    <div class="displayTableCell vat fs20 tal">
                        <el-radio v-model="selectedRate" :label="rate.rate_id">&nbsp;</el-radio>
                    </div>
                    <div class="displayTableCell vat pbl pls pts tal cursorPointer" @click="selectedRate = rate.rate_id">
                        <div class="fwb fs16 inlineBlock mrs">{{ $n(rate.shipping_amount.amount, 'currency') }}</div>
                        <div class="inlineBlock">{{ $t(`shipping.${rate.service_code}.desc`) }}</div>
                    </div>
                </div>
            </div>
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
