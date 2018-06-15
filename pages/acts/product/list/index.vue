<script>
import Vue from 'vue'
import { Dialog, Button } from 'element-ui'
import forEach from 'lodash.foreach'
import TableHeaderLink from '@/components/TableHeaderLink'
import ProductDetailsJsonView from '@/components/product/admin/ProductDetailsJsonView'
import product_mixin from '@/mixins/product_mixin'
import IconEye from '@/components/icons/IconEye'
import IconPencil from '@/components/icons/IconPencil'

Vue.use(Dialog)
Vue.use(Button)

export default {
    middleware: [
        'authenticated'
    ],

    layout: 'admin',

    components: {
        TableHeaderLink,
        ProductDetailsJsonView,
        IconEye,
        IconPencil
    },

    mixins: [
        product_mixin
    ],

    data() {
        return {
            products: [],
            quickViewProduct: null,
            modalIsActive: false,
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
            //     ['inventory_count', '>', 0]
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
                //     ['inventory_count', '>', 0]
                // ],
                ...this.sortData
            });
        },

        subTypeLabel(subType) {
            let values = [];
            let self = this;

            forEach(this.getProductSubTypeData(), function(obj, key) {
                if(subType & key) {
                    values.push(
                        self.$tc(key, 2)
                    );
                }
            });

            return values.join(', ');
        },

        sort(sortData) {
            this.sortData = sortData;
            this.fetchProducts();
        },

        openQuickView(product) {
            this.quickViewProduct = product;
            this.modalIsActive = true;
        }
    }
}
</script>


<template>
    <div class="pal">

        <div class="tar mbl">
            <el-button type="primary" @click="goToAdminProductAdd">ADD PRODUCT</el-button>
        </div>

        <table v-show="products.length" class="table">
            <thead>
                <tr>
                    <th>Featured Image</th>
                    <th>
                        <table-header-link
                                attribute="is_available"
                                :sort-data="sortData"
                                @change="sort">Available</table-header-link>
                    </th>
                    <th>
                        <table-header-link
                                attribute="sub_type"
                                :sort-data="sortData"
                                @change="sort">Type</table-header-link>
                    </th>
                    <th>
                        <table-header-link
                                attribute="title"
                                :sort-data="sortData"
                                @change="sort">Title</table-header-link>
                    </th>
                    <th>Display Price</th>
                    <th class="hide_medium_down">
                        <table-header-link
                                attribute="updated_at"
                                :sort-data="sortData"
                                @change="sort">Updated</table-header-link>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in products" :key="product.id">
                    <!-- featured image -->
                    <td>
                        <img v-if="product.pics.length"
                            :src="featuredProductPic(product)"
                            alt="Image"
                            class="prodPicSmall" />
                        <div class="fs12"># pictures: {{ product.pics.length }}</div>
                    </td>

                    <!-- is available -->
                    <td>
                        <span v-bind:class="{'colorGreen':product.is_available, 'colorRed':!product.is_available}">
                            {{ product.is_available ? 'Yes' : 'No '}}
                        </span>
                    </td>

                    <!-- product sub-type -->
                    <td>{{ subTypeLabel(product.sub_type) }}</td>

                    <!-- product title -->
                    <td>
                        <div>{{ product.title }}</div>

                        <div>
                            <el-button type="text" @click="openQuickView(product)" class="mrl">
                                <icon-eye icon-name="preview" class-name="fillBlue" width="25px" />
                            </el-button>

                            <el-button type="text" @click="goToAdminProductUpsert(product.id)">
                                <icon-pencil icon-name="pencil" class-name="fillBlue" width="25px" />
                            </el-button>
                        </div>
                    </td>

                    <!-- display price -->
                    <td>{{ product.display_price }}</td>

                    <!-- display price -->
                    <td class="hide_medium_down">{{ product.updated_at | format8601 }}</td>
                </tr>
            </tbody>
        </table>
        <div v-show="!products.length">{{ $t('No results') }}</div>

        <el-dialog :title="quickViewProduct ? quickViewProduct.title : null"
                    :visible.sync="modalIsActive"
                    :modal-append-to-body="false"
                    width="95%">
            <product-details-json-view :product="quickViewProduct"></product-details-json-view>
        </el-dialog>

    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_table.scss";

    .prodPicSmall {
        width: 70px;
    }
</style>
