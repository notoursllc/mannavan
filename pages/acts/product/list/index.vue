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
        OperationsDropdown: () => import('@/components/OperationsDropdown'),
        Fab: () => import('@/components/Fab')
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

    methods: {
        async fetchProducts() {
            try {
                this.products = await this.$api.products.list({
                    // where: ['is_available', '=', true],
                    // whereRaw: ['sub_type & ? > 0', [productTypeId]],
                    // andWhere: [
                    //     ['total_inventory_count', '>', 0]
                    // ],
                    ...this.sortData
                });
            }
            catch(err) {
                this.$errorMessage(
                    err.message,
                    { closeOthers: true }
                )
            }
        },

        sortChanged(val) {
            this.sortData.orderBy = val.prop || 'updated_at';
            this.sortData.orderDir = val.order === 'ascending' ? 'ASC' : 'DESC';
            this.fetchProducts();
        },

        async onProductDelete(product) {
            try {
                await this.$confirm(`Delete product "${ product.title }"?`, 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                await this.deleteProduct(product.id);
                this.$successMessage(`"${ product.title }" deleted successfully`);
                this.fetchProducts();
            }
            catch(err) {
                // Do nothing
            }
        },

        numberOfPicsInProduct(product) {
            let count = 0;

            if(Array.isArray(product.variations)) {
                product.variations.forEach((variation) => {
                    if(variation.published && Array.isArray(variation.pics)) {
                        variation.pics.forEach((pic) => {
                            if(pic.is_visible) {
                                count++;
                            }
                        })
                    }
                })
            }

            return count;
        },

        getInventoryCountString(prod) {
            const numVariants = Array.isArray(prod.variants) ? prod.variants.length : 0;
            const totalInventoryCount = prod.total_inventory_count || 0;

            if(numVariants) {
                return this.$tc(
                    'n_in_stock_for_n_variants',
                    numVariants,
                    { numInventory: totalInventoryCount, numVariants: numVariants }
                );
            }

            return this.$t('n_in_stock', { numInventory: totalInventoryCount })
        }
    },

    created() {
        this.fetchProducts();
    }
}
</script>


<template>
    <div>
        <fab type="add" @click="goToAdminProductAdd" />

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
                width="140">
                <template slot-scope="scope">
                    <template v-if="featuredProductPic(scope.row)">
                        <img :src="featuredProductPic(scope.row)"
                            alt="Image"
                            class="prodPicSmall" />
                        <div class="fs12"># pictures: {{ numberOfPicsInProduct(scope.row) }}</div>
                    </template>
                </template>
            </el-table-column>

            <!-- title -->
            <el-table-column
                prop="title"
                label="Title"
                sortable="custom">
                <template slot-scope="scope">
                    {{ scope.row.title }}
                    <operations-dropdown
                        @view="goToAdminProductDetails(scope.row.id)"
                        @edit="goToAdminProductUpsert(scope.row.id)"
                        @delete="onProductDelete(scope.row)" />
                </template>
            </el-table-column>

            <!-- inventory count -->
            <el-table-column
                label="Inventory">
                <template slot-scope="scope">
                    {{ getInventoryCountString(scope.row) }}
                </template>
            </el-table-column>

            <!-- published -->
            <el-table-column
                label="Published"
                width="120"
                prop="published"
                sortable="custom">
                <template slot-scope="scope">
                    <span v-bind:class="{'colorGreen':scope.row.published, 'colorRed':!scope.row.published}">
                        {{ scope.row.published ? 'Yes' : 'No '}}
                    </span>
                </template>
            </el-table-column>

            <!-- product sub-type -->
            <el-table-column
                label="Sub Type"
                prop="sub_type"
                width="120"
                sortable="custom">
                <template slot-scope="scope">
                    {{ prodmix_getSubTypeLabel(scope.row.sub_type) }}
                </template>
            </el-table-column>

            <!-- vendor -->
            <el-table-column
                prop="vendor"
                label="Vendor" />
        </el-table>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_table.scss";

    .prodPicSmall {
        width: 70px;
    }
</style>
