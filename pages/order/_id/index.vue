<script>
import Vue from 'vue'
import { Loading } from 'element-ui'
import PaymentTypeDisplay from '@/components/PaymentTypeDisplay'
import order_mixin from '@/mixins/order_mixin'
import IconVictoryPeace from '@/components/icons/IconVictoryPeace'
import IconEnvelope from '@/components/icons/IconEnvelope'

Vue.use(Loading.directive)

export default {
    components: {
        PaymentTypeDisplay,
        IconVictoryPeace,
        IconEnvelope
    },

    mixins: [
        order_mixin
    ],

    data: function() {
        return {
            loading: true
        }
    },

    async created() {
        try {
            this.$store.dispatch('ui/pageTitle', null);

            this.order = await this.getOrder(this.$route.params.id);
            this.orderExists = true;
            this.loading = false;
        }
        catch(e) {
            this.orderExists = false;
            this.loading = false;
        }
    },

    head() {
        return {
            title: this.$t('We have a winner!'),
            meta: [
                { vmid: 'description', name: 'description', content: `Thanks for your order from Gmnst` }
            ]
        }
    }
}
</script>


<template>
    <div class="pageContainerMax pageContainerMaxSkinny">
        <div v-if="!orderExists" class="tac">
            {{ $t('Oops we could not find the order you are looking for.') }}
        </div>

        <div v-else>
            <div class="tac">
                <icon-victory-peace icon-name="thanks" icon-color="#6da76a" width="150px" />
                <div class="fs30 fwb">{{ $t('We have a winner!') }}</div>
            </div>

            <div v-loading="loading">
                <div class="mtl grayCell">
                    <div class="colorGreen">
                        <span class="fs16">{{ $t('An email confirmation was sent to:' )}}</span>
                        <div class="tac" style="margin-bottom:-10px">
                            <icon-envelope icon-name="email" icon-color="#6da76a" width="50px" />
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
                        <div>
                            <div>{{ formattedName }}</div>
                            <div v-if="order.shipping.company">{{ companyDisplay }}</div>
                            <div>{{ order.shipping.streetAddress }}</div>
                            <div v-if="order.shipping.extendedAddress">{{ order.shipping.extendedAddress }}</div>
                            <div>{{ formattedCityStateZip }}</div>
                            <div>{{ order.shipping.countryCodeAlpha2 }}</div>
                        </div>
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
                                <a v-if="order.id" @click="goToOrderDetails(order.transaction.id)">{{ order.transaction.id }}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
