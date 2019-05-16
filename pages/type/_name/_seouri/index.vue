<script>
import Vue from 'vue'
import Promise from 'bluebird';
import isObject from 'lodash.isobject'
import _forEach from 'lodash.foreach'
import { Select, Option, InputNumber, Notification, Button, Loading, Dialog } from 'element-ui'
import ProductPrice from '@/components/product/ProductPrice'
import ProductDetailsDisplay from '@/components/product/ProductDetailsDisplay'
import ProductImageCarousel from '@/components/product/ProductImageCarousel'
import TshirtSizeChart from '@/components/product/TshirtSizeChart'
import ProductQuantityInput from '@/components/product/ProductQuantityInput'
import product_mixin from '@/mixins/product_mixin'
import app_mixin from '@/mixins/app_mixin'
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'


Vue.use(Select);
Vue.use(Option);
Vue.use(InputNumber);
Vue.use(Button);
Vue.use(Dialog);
Vue.use(Loading.directive)


Vue.prototype.$notify = Notification;
let currentNotification = null;


function showNotification(Notification) {
    if(currentNotification) {
        currentNotification.close();
    }

    currentNotification = Notification
}


export default {
    components: {
        ProductPrice,
        ProductQuantityInput,
        ProductDetailsDisplay,
        ProductImageCarousel,
        TshirtSizeChart
    },

    data() {
        return {
            product: null,
            sizeOptions: [],
            selectedSize: null,
            selectedQty: 1,
            isLoading: false,
            siteUrl: this.getSiteUrl(true),
            pageUrl: `${this.getSiteUrl(true)}${this.$route.fullPath}`,
            twitterUser: this.getTwitterUser(),
            artistDialog: {
                visible: false
            }
        }
    },

    mixins: [
        product_mixin,
        app_mixin,
        shopping_cart_mixin
    ],

    computed: {
        productTitle() {
            return this.product ? this.product.title : '';
        },
        productDesc() {
            return this.product ? this.product.description_long : '';
        },
        mediaPicture() {
            return `${this.siteUrl}${this.product.pics[0]}`
        }
    },

    async asyncData({ params, store, app }) {
        try {
            const data = {};
            data.product = await product_mixin.methods.getProductBySeoUri.call(app, params.seouri);

            if(!data.product) {
                return;
            }

            let opts = product_mixin.methods.buildSizeOptions(data.product);
            data.sizeOptions = opts.sizeOpts;

            store.dispatch('ui/pageTitle', data.product.title);

            return data;
        }
        catch(err) {
            console.log("Error getting product", err)
        }
    },

    methods: {
        addToCart: async function() {
            if (!this.selectedSize) {
                showNotification(
                    this.$notify({
                        type: 'error',
                        title: this.$t('Please select a size'),
                        message: this.$t('We want to make sure it fits!'),
                        duration: 0
                    })
                )
            }
            else if (!this.selectedQty) {
                showNotification(
                    this.$notify({
                        type: 'error',
                        title: this.$t('Please select a quantity'),
                        message: this.$t('Thanks!'),
                        duration: 0
                    })
                )
            }
            else {
                this.isLoading = true;

                try {
                    const response = await this.addItem({
                        id: this.product.id,
                        options: {
                            size: this.selectedSize,
                            qty: this.selectedQty
                        }
                    });
                    this.setCartAndTokenStateFromResponse(response);

                    this.isLoading = false;
                    this.goToCart();
                    return;
                }
                catch(err) {
                    this.isLoading = false;

                    showNotification(
                        this.$notify({
                            type: 'error',
                            title: this.$t('Error'),
                            message: err.response.data.message,
                            duration: 0
                        })
                    )
                }
            }
        },

        goToCart: function() {
            // this.$router.push(`/cart/${this.product.id}`);
            this.$router.push({
                name: 'cart-id',
                params: { id: this.product.id }
            });
        }
    },

    created() {
        if(!this.product) {
            showNotification(
                this.$notify({
                    type: 'error',
                    title: this.$t('Product not found'),
                    // message: null,
                    duration: 0
                })
            )
        }
    },

    head() {
        return {
            title: this.productTitle,
            meta: [
                { vmid: 'description', name: 'description', content: this.productDesc },
                { name: 'og:site_name', content: this.getSiteName() },
                { name: 'og:url', content: this.$route.fullPath },
                { name: 'og:title', content: this.productTitle },
                { name: 'og:type', content: 'website' },
                { name: 'og:image', content: this.mediaPicture },
                { name: 'og:description', content: this.product ? this.product.description_long: '' },
            ]
        }
    }
}
</script>


<template>
    <div class="pageContainerMax">
        <product-details-display v-if="product">
            <!-- pics -->
            <template slot="pics">
                <product-image-carousel :product="product" />
            </template>

            <!-- description -->
            <div slot="description" class="fs16">{{ product.description_long }}</div>

            <!-- artist -->
            <div slot="artist" v-if="product.artist && product.artist.id" class="mtl fs12">
                {{ $t('Artist') }}:
                <span class="underlineDotted cursorPointer mls"
                    @click="artistDialog.visible = true">{{ product.artist.name }}</span>
            </div>

            <!-- price -->
            <div slot="price" class="mtl fs20">
                <product-price :product="product"></product-price>
            </div>

            <!-- size -->
            <template slot="size">
                <div class="fwb">{{ $t('Size') }}</div>
                <el-select
                    v-model="selectedSize"
                    :no-data-text="$t('Sorry this item does not have any sizes available')"
                    placeholder="Select"
                    class="width125">
                    <el-option
                        v-for="size in sizeOptions"
                        :key="size"
                        :label="$t(size)"
                        :value="size" />
                </el-select>
            </template>

            <!-- quantity -->
            <template slot="quantity">
                <div class="fwb">{{ $t('Quantity') }}</div>

                <div>
                    <div class="displayTableCell prl fs20 vat pts colorGreen fw600">{{ selectedQty }}</div>
                    <div class="displayTableCell">
                        <product-quantity-input
                            v-model="selectedQty"
                            :sizes="product.sizes"
                            :selected-size="selectedSize" />
                    </div>
                </div>
            </template>

            <!-- add to cart button -->
            <div slot="button" class="ptl">
                <el-button
                    type="primary"
                    @click="addToCart"
                    :loading="isLoading"
                    round>{{ $t('ADD TO CART') }}</el-button>
            </div>

            <!-- size chart -->
            <div slot="under" class="ptl">
                <div class="fs16 mbm">{{ $t('Sizing') }}:</div>
                <tshirt-size-chart
                    :fit="product.fit"
                    :material="product.material_type"
                    :highlight="selectedSize" />
            </div>
        </product-details-display>

        <!-- artist dialog -->
        <el-dialog
            :title="product.artist ? product.artist.name : null"
            :visible.sync="artistDialog.visible"
            top="5vh"
            width="320px">
            <div class="mtm">{{ product.artist ? product.artist.description_long : null }}</div>
        </el-dialog>
    </div>
</template>

