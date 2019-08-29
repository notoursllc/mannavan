<script>
import isObject from 'lodash.isobject';
import _forEach from 'lodash.foreach';
import product_mixin from '@/mixins/product_mixin';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';

const globalTypes = process.env.GLOBAL_TYPES;

export default {
    name: 'ProductDetails',

    props: {
        product: {
            type: Object,
            required: true
        }
    },

    components: {
        ProductPrice: () => import('@/components/product/ProductPrice'),
        ProductQuantityWarning: () => import('@/components/product/ProductQuantityWarning'),
        ProductDetailsLayout: () => import('@/components/product/details/ProductDetailsLayout'),
        ProductImageCarousel: () => import('@/components/product/ProductImageCarousel'),
        ProductSizeButtons: () => import('@/components/product/ProductSizeButtons'),
        TshirtSizeChart: () => import('@/components/product/TshirtSizeChart'),
        NumberInput: () => import('@/components/NumberInput')
    },

    data() {
        return {
            selectedSize: null,
            selectedQty: 1,
            productQuantityMaxValue: 30,
            isLoading: false,
            siteUrl: this.$store.state.ui.siteUrlLong,
            pageUrl: `${this.$store.state.ui.siteUrlLong}${this.$route.fullPath}`,
            twitterUser: this.$store.state.ui.twitterUser,
            artistDialog: {
                visible: false
            }
        }
    },

    mixins: [
        product_mixin,
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
            return this.product ? `${this.siteUrl}${this.product.pics[0]}` : '';
        },
        showSizeChart() {
            return this.product && this.product.sub_type & globalTypes.product.subtypes.PRODUCT_SUBTYPE_TOPS;
        },
        sizeOptions() {
            let opts = this.buildSizeOptions(this.product);
            return opts.sizeOpts;
        }
    },

    methods: {
        addToCart: async function() {
            if (!this.selectedSize) {
                this.$errorMessage(
                    this.$t('Please select a size'),
                    { closeOthers: true }
                )
            }
            else if (!this.selectedQty) {
                this.$errorMessage(
                    this.$t('Please select a quantity'),
                    { closeOthers: true }
                )
            }
            else {
                this.isLoading = true;

                const addItemConfig = {
                    id: this.product.id,
                    options: {
                        size: this.selectedSize,
                        qty: this.selectedQty
                    }
                };

                try {
                    const response = await this.addItem(addItemConfig);
                    this.setCartAndTokenStateFromResponse(response);

                    this.isLoading = false;

                    this.$nuxt.$emit('PRODUCT_ADDED_TO_CART', this.product);
                }
                catch(err) {
                    this.isLoading = false;

                    this.$errorMessage(
                        err.response.data.message,
                    );

                    this.$bugsnag.notify(err, {
                        request: {
                            addItem: addItemConfig
                        }
                    });
                }
            }
        },

        onSizeChange(newVal) {
            const inventoryCount = this.getInventoryCountForSize(newVal, this.product);

            if(inventoryCount) {
                this.productQuantityMaxValue = inventoryCount;

                if(inventoryCount < this.selectedQty) {
                    this.selectedQty = this.productQuantityMaxValue;
                }
            }
        }
    }
}
</script>


<template>
    <div>
        <product-details-layout>
            <!-- pics -->
            <template slot="pics">
                <product-image-carousel :product="product" />
            </template>

            <template slot="info">
                <!-- title -->
                <div class="fs20 pbm">{{ product.title }}</div>

                <!-- description -->
                <div class="fs16">{{ product.description_long }}</div>

                <!-- artist -->
                <div v-if="product.artist && product.artist.id" class="mtl fs12">
                    {{ $t('Artist') }}:
                    <span class="underlineDotted cursorPointer mls"
                        @click="artistDialog.visible = true">{{ product.artist.name }}</span>
                </div>

                <!-- price -->
                <div class="mtl fs20">
                    <product-price :product="product"></product-price>
                </div>

                <hr/>

                <!-- size -->
                <div class="mbl">
                    <div class="fwb mbs">{{ $t('Size') }}:</div>
                    <product-size-buttons
                        v-model="selectedSize"
                        @input="onSizeChange"
                        :product="product" />
                </div>

                <!-- quantity -->
                <div v-if="sizeOptions.length" style="max-width:175px">
                    <div class="mbs">
                        <span class="fwb">{{ $t('Quantity') }}:</span>
                        <span class="plm"><product-quantity-warning :max="productQuantityMaxValue" /></span>
                    </div>
                    <number-input
                        v-model="selectedQty"
                        :min="1"
                        :max="productQuantityMaxValue" />
                </div>

                <!-- add to cart button -->
                <div class="tac ptxl">
                    <el-button
                        type="primary"
                        @click="addToCart"
                        :loading="isLoading"
                        :disabled="!sizeOptions.length"
                        round
                        class="is-huge">{{ $t('Add To Your Order') }}</el-button>
                </div>
            </template>

            <!-- size chart -->
            <div slot="under"
                class="ptxl"
                v-if="showSizeChart">
                <div class="fs16 mbm">{{ $t('Sizing') }}:</div>
                <tshirt-size-chart
                    :fit="product.fit"
                    :material="product.material_type"
                    :highlight="selectedSize" />
            </div>
        </product-details-layout>

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

