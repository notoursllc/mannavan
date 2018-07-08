<script>
import Vue from 'vue'
import { Radio, Table, TableColumn } from 'element-ui'

Vue.use(Radio);
Vue.use(Table);
Vue.use(TableColumn);

export default {
    props: {
        value: {},

        rates: {
            type: Array,
            required: false
        }
    },

    data: function() {
        return {
            shippingRates: [],
            selectedRate: null
        }
    },

    methods: {
        // Keeping this simple for now... just returning the one lowest rate
        processShippingRates: function(rates) {
            let lowestRate = null;

            if(Array.isArray(rates)) {
                if(!lowestRate) {
                    lowestRate = rates[0];
                }

                rates.forEach((rate) => {
                    if(parseFloat(rate.amount) < parseFloat(lowestRate.amount)) {
                        lowestRate = rate;
                    }
                })
            }

            // Fallback... hopefully this never happens
            if(!lowestRate) {
                lowestRate = {
                    amount: '5.00',
                    currency: 'USD',
                    provider: 'USPS',
                    provider_image_75: 'https://shippo-static.s3.amazonaws.com/providers/75/USPS.png',
                    provider_image_200: 'https://shippo-static.s3.amazonaws.com/providers/200/USPS.png',
                    servicelevel: {
                        name: 'First-Class Package/Mail Parcel',
                        token: 'usps_first',
                    },
                    estimated_days: 5
                };
            }

            this.shippingRates = [lowestRate];

            // since we're only providing one option for now, making it the
            // default selected option:
            this.selectTableRow(lowestRate);
        },

        handleTableRowSelect(val) {
            this.selectedRate = val;
        },

        selectTableRow(row) {
            this.$refs.ratesTable.setCurrentRow(row);
        },


        /*
        processShippingRates1: function(rates) {
            let filteredRates = {};

            function addIfLowestPrice(rate, attribute) {
                // a cache to keep track of rate ids that were added
                // so we dont add the same rate twice
                if(!addIfLowestPrice.hasOwnProperty('added')) {
                    addIfLowestPrice.added = [];
                }

                let addedRate = false;

                if(addIfLowestPrice.added.indexOf(rate.object_id) === -1) {
                    if(!filteredRates.hasOwnProperty(attribute)) {
                        filteredRates[attribute] = rate;
                        addIfLowestPrice.added.push(rate.object_id);
                        addedRate = true;
                    }
                    // else if(filteredRates[attribute].amount > rate.amount) {
                    else {
                        if(filteredRates[attribute].amount > rate.amount) {
                            filteredRates[attribute] = rate;
                            addIfLowestPrice.added.push(rate.object_id);
                            addedRate = true;
                        }
                    }
                }

                return addedRate;
            }

            rates.forEach((rate) => {
                if(Array.isArray(rate.attributes)) {
                    rate.attributes.forEach((attr) => {
                        addIfLowestPrice(rate, attr);
                    })

                    // let len = rate.attributes.length;

                    // if(len) {
                    //     // if(len === 1 && !filteredRates.hasOwnProperty(rate.attributes[0])) {
                    //     if(len === 1) {
                    //         addIfLowestPrice(rate, rate.attributes[0]);
                    //     }
                    //     else {
                    //         let added = false;

                    //         rate.attributes.forEach((attr) => {
                    //             // the added flag makes sure we don't add the same rate to
                    //             // the filteredRates object twice (the same rate can have multiple attributes
                    //             // in the rates array)
                    //             if(!filteredRates.hasOwnProperty(attr) && !added) {
                    //                 filteredRates[attr] = rate;
                    //                 added = true;
                    //             }
                    //         })
                    //     }
                    // }
                }
            });

            this.shippingRates = filteredRates;
        }
        */
    },

    created: function() {
         const unwatch = this.$watch('rates', val => {
            if(val) {
                this.processShippingRates(val);
                unwatch();
            }
        });
        // }, {immediate: true});

        this.$watch('selectedRate', val => {
            this.$emit('input', val)
        });
    }
}
</script>

<template>
    <el-table
        ref="ratesTable"
        :data="shippingRates"
        highlight-current-row
        @current-change="handleTableRowSelect"
        class="widthAll">
        <el-table-column width="55">
            <template slot-scope="scope">
                <el-radio v-model="selectedRate" :label="scope.row">&nbsp;</el-radio>
            </template>
        </el-table-column>

        <!-- estimated days -->
        <el-table-column
            prop="estimated_days"
            label="Estimated delivery">
            <template slot-scope="scope">
                {{ `${scope.row.estimated_days} ${$tc('day_days', scope.row.estimated_days)}` }}
            </template>
        </el-table-column>

        <!-- price -->
        <el-table-column
            prop="amount"
            label="Amount"
            width="100">
            <template slot-scope="scope">
                {{ $n(scope.row.amount, 'currency') }}
            </template>
        </el-table-column>
    </el-table>
</template>
