<script>
import forEach from 'lodash.foreach'
import product_mixin from '@/mixins/product_mixin'


export default {
    middleware: [
        'authenticated'
    ],

    layout: 'admin',

    components: {
        ProductDetailsJsonView: () => import('@/components/product/admin/ProductDetailsJsonView'),
        IconPencil: () => import('@/components/icons/IconPencil')
    },

    mixins: [
        product_mixin
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
        const products = await product_mixin.methods.getProducts.call(app, {
            // where: ['is_available', '=', true],
            // andWhere: [
            //     ['total_inventory_count', '>', 0]
            // ],
            orderBy: 'updated_at',
            orderDir: 'DESC'
        });

        return {
            products
        }
    },

    methods: {
        async fetchProducts() {
            this.products = await this.getProducts({
                // where: ['is_available', '=', true],
                // whereRaw: ['sub_type & ? > 0', [productTypeId]],
                // andWhere: [
                //     ['total_inventory_count', '>', 0]
                // ],
                ...this.sortData
            });
        },

        subTypeLabel(subType) {
            let values = [];
            let self = this;

            forEach(this.getProductSubTypes(), function(val, key) {
                if(subType & key) {
                    values.push(
                        self.$tc(key, 2)
                    );
                }
            });

            return values.join(', ');
        },

        sortChanged(val) {
            this.sortData.orderBy = val.prop || 'updated_at';
            this.sortData.orderDir = val.order === 'ascending' ? 'ASC' : 'DESC';
            this.fetchProducts();
        }
    }
}
</script>


<template>
    <div class="pal">

        <div class="tar mbl">
            <el-button type="primary" @click="goToAdminProductAdd">ADD PRODUCT</el-button>
        </div>

        <el-table
            :data="products"
            class="widthAll"
            @sort-change="sortChanged">

            <el-table-column type="expand">
                <template slot-scope="scope">
                    <product-details-json-view :product="scope.row"></product-details-json-view>
                </template>
            </el-table-column>

            <!-- featured image -->
            <el-table-column
                label="Featured Image"
                width="140">
                <template slot-scope="scope">
                    <img v-if="scope.row.pics.length"
                        :src="featuredProductPic(scope.row)"
                        alt="Image"
                        class="prodPicSmall" />
                    <div class="fs12"># pictures: {{ scope.row.pics.length }}</div>
                </template>
            </el-table-column>

            <!-- title -->
            <el-table-column
                prop="title"
                label="Title"
                sortable="custom">
                <template slot-scope="scope">
                    <div>{{ scope.row.title }}</div>
                    <el-button type="text" @click="goToAdminProductUpsert(scope.row.id)">EDIT</el-button>
                </template>
            </el-table-column>

            <!-- available -->
            <el-table-column
                label="Available"
                width="120"
                prop="is_available"
                sortable="custom">
                <template slot-scope="scope">
                    <span v-bind:class="{'colorGreen':scope.row.is_available, 'colorRed':!scope.row.is_available}">
                        {{ scope.row.is_available ? 'Yes' : 'No '}}
                    </span>
                </template>
            </el-table-column>

            <!-- product sub-type -->
            <el-table-column
                label="Type"
                prop="sub_type"
                width="120"
                sortable="custom">
                <template slot-scope="scope">
                    {{ subTypeLabel(scope.row.sub_type) }}
                </template>
            </el-table-column>

            <!-- display price -->
            <el-table-column
                prop="display_price"
                label="Display Price"
                width="140"></el-table-column>

            <!-- updated -->
            <el-table-column
                label="Updated"
                prop="updated_at"
                width="120"
                sortable="custom">
                <template slot-scope="scope">
                    {{ scope.row.updated_at | format8601 }}
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_table.scss";

    .prodPicSmall {
        width: 70px;
    }
</style>
