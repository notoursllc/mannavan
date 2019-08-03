<script>
import payment_mixin from '@/mixins/payment_mixin'
import shipping_mixin from '@/mixins/shipping_mixin'


export default {
    middleware: [
        'authenticated'
    ],

    layout: 'admin',

    components: {
        IconPencil: () => import('@/components/icons/IconPencil')
    },

    mixins: [
        shipping_mixin
    ],

    data() {
        return {
            products: [],
            sortData: {
                orderBy: 'updated_at',
                orderDir: 'DESC'
            }
        }
    },

    async asyncData({ params, store, app }) {
        const payments = await payment_mixin.methods.getPayments.call(app, {
            // where: ['is_available', '=', true],
            // andWhere: [
            //     ['total_inventory_count', '>', 0]
            // ],
            orderBy: 'updated_at',
            orderDir: 'DESC'
        });

        return {
            payments
        }
    },

    methods: {
        async fetchOrders() {
            this.payments = await this.getPayments({
                // where: ['is_available', '=', true],
                // whereRaw: ['sub_type & ? > 0', [productTypeId]],
                // andWhere: [
                //     ['total_inventory_count', '>', 0]
                // ],
                ...this.sortData
            });
        },

        sortChanged(val) {
            this.sortData.orderBy = val.prop || 'updated_at';
            this.sortData.orderDir = val.order === 'ascending' ? 'ASC' : 'DESC';
            this.fetchOrders();
        }
    }
}
</script>


<template>
    <el-table
        :data="payments"
        class="widthAll"
        @sort-change="sortChanged">

        <el-table-column type="expand">
            <template slot-scope="scope">
                <pre style="overflow-x:scroll">{{ scope.row | formatJson }}</pre>
            </template>
        </el-table-column>

        <!-- updated -->
        <el-table-column
            label="Updated"
            prop="updated_at"
            sortable="custom">
            <template slot-scope="scope">
                <nuxt-link :to="{ name: 'acts-order-id', params: { id: scope.row.id } }"
                            tag="a">{{ scope.row.updated_at | format8601 }}</nuxt-link>
            </template>
        </el-table-column>

        <!-- success -->
        <el-table-column
            label="Square Status">
            <template slot-scope="scope">
                <div v-for="obj in scope.row.transaction.tenders" :key="obj.id">
                    {{ obj.card_details.status }}
                </div>
            </template>
        </el-table-column>

        <!-- shipping total -->
        <el-table-column label="Shipping total">
            <template slot-scope="scope">
                {{ scope.row.shoppingCart.shipping_total }}
            </template>
        </el-table-column>

        <!-- grand total -->
        <el-table-column label="Grand total">
            <template slot-scope="scope">
                {{ scope.row.shoppingCart.grand_total }}
            </template>
        </el-table-column>
    </el-table>
</template>


<style lang="scss">
    @import "~assets/css/components/_table.scss";

    .prodPicSmall {
        width: 70px;
    }
</style>
