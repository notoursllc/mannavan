<script>
import Vue from 'vue'
import { Loading } from 'element-ui'
import PaymentTypeDisplay from '@/components/PaymentTypeDisplay'
import order_mixin from '@/mixins/order_mixin'
import app_mixin from '@/mixins/app_mixin'
import IconVictoryPeace from '@/components/icons/IconVictoryPeace'
import IconEnvelope from '@/components/icons/IconEnvelope'
import AddressDisplay from '@/components/AddressDisplay'

Vue.use(Loading.directive)

export default {
    components: {
        PaymentTypeDisplay,
        IconVictoryPeace,
        IconEnvelope,
        AddressDisplay
    },

    mixins: [
        order_mixin,
        app_mixin
    ],

    data: function() {
        return {
            loading: true,
            orderExists: false,
            order: {
                shipping: {},
                shoppingCart: {},
                transaction: {
                    payment: {}
                }
            }
        }
    },

    async created() {
        try {
            this.$store.dispatch('ui/pageTitle', null);
            this.order = await this.getOrderSummary(this.$route.params.id);
            this.orderExists = true;
        }
        catch(e) {
            this.orderExists = false;
        }

        this.loading = false;
    },

    head() {
        return {
            title: this.$t('We have a winner!'),
            meta: [
                { vmid: 'description', name: 'description', content: `Thanks for your order from ${this.getSiteName()}` }
            ]
        }
    }
}
</script>


<template>
    <div class="pageContainerMax pageContainerMaxSkinny" v-loading.fullscreen.lock="loading">
        <template v-if="!loading">
            <div v-if="!orderExists" class="tac">
                {{ $t('Oops we could not find the order you are looking for.') }}
            </div>

            <div v-else>
                <div class="tac sway">
                    <icon-victory-peace icon-name="thanks" class-name="fillGreen" width="150px" />
                </div>

                <div class="mtl grayCell">
                    <div class="colorGreen">
                        <span class="fs16">{{ $t('An email confirmation was sent to:' )}}</span>
                        <div class="tac" style="margin-bottom:-10px">
                            <icon-envelope icon-name="email" class-name="fillGreen" width="50px" />
                        </div>
                        <div class="fwb fs20">
                            {{ order.shoppingCart.shipping_email }}
                        </div>
                    </div>

                    <div class="fs12 mts">({{ $t('Please allow a few minutes for email delivery.' )}})</div>
                </div>

                <div class="displayTable mha">
                    <div class="mtl">
                        <div class="fwb">{{ $t('Shipping to') }}:</div>
                        <address-display
                            :first-name="order.shipping.firstName"
                            :last-name="order.shipping.lastName"
                            :street-address="order.shipping.streetAddress"
                            :extended-address="order.shipping.extendedAddress"
                            :company="order.shipping.company"
                            :country-code="order.shipping.countryCodeAlpha2"
                            :city="order.shipping.locality"
                            :state="order.shipping.region"
                            :zip="order.shipping.postalCode" />
                    </div>

                    <div class="mtl">
                        <div class="displayTableRow">
                            <div class="displayTableCell prm pbs">{{ $t('# items') }}:</div>
                            <div class="displayTableCell fwb pbs">{{ order.shoppingCart.num_items }}</div>
                        </div>

                        <div class="displayTableRow">
                            <div class="displayTableCell prm pbs">{{ $t('Total') }}:</div>
                            <div class="displayTableCell fwb pbs">{{ $n(order.transaction.amount, 'currency') }}</div>
                        </div>

                        <div class="displayTableRow">
                            <div class="displayTableCell prm pbs">{{ $t('Payment method') }}:</div>
                            <div class="displayTableCell fwb pbs">
                                <payment-type-display :card-type="cardType"
                                                    :last-four="order.transaction.payment.last4"
                                                    :payer-email="order.transaction.payment.payerEmail"></payment-type-display>
                            </div>
                        </div>

                        <div class="displayTableRow">
                            <div class="displayTableCell prm pbs">{{ $t('Order') }}:</div>
                            <div class="displayTableCell fwb pbs">
                                <a v-if="order.id" @click="goToOrderDetails(order.id)">{{ order.id }}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<style lang="scss" scoped>
    @import "~assets/css/components/_variables.scss";
    @import "~assets/css/components/_mixins.scss";

    .grayCell {
        padding: 10px;
        margin: 20px auto 0 auto;
        display: table;
        font-size: 14px;
        @include rounded();
        background-color: $bgGrayZebra;
        width: 100%;
        text-align: center;
    }

    .icon-victory-peace {
        font-size: 100px;
    }
</style>
