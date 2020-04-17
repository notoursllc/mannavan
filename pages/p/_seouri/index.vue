<script>
import isObject from 'lodash.isobject';
import product_mixin from '@/mixins/product_mixin';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';


export default {
    components: {
        ProductPrice: () => import('@/components/product/ProductPrice'),
        ProductQuantityWarning: () => import('@/components/product/ProductQuantityWarning'),
        ProductDetailsLayout: () => import('@/components/product/ProductDetailsLayout'),
        ProductImageCarousel: () => import('@/components/product/ProductImageCarousel'),
        ProductSizeButtons: () => import('@/components/product/ProductSizeButtons'),
        ProductAttributeSelector: () => import('@/components/product/ProductAttributeSelector'),
        TshirtSizeChart: () => import('@/components/product/TshirtSizeChart'),
        NumberInput: () => import('@/components/NumberInput')
    },

    mixins: [
        product_mixin,
        shopping_cart_mixin
    ],

    data() {
        return {
            product: {},
            skuOptions: {},
            selectedSize: null,
            selectedQty: 1,
            productQuantityMaxValue: 30,
            isLoading: false,
            siteUrl: this.$store.state.ui.siteUrlLong,
            pageUrl: `${this.$store.state.ui.siteUrlLong}${this.$route.fullPath}`,
            twitterUser: this.$store.state.ui.twitterUser
        };
    },

    async asyncData({ params, store, app }) {
        try {
            const data = {};
            // data.product = await product_mixin.methods.getProductBySeoUri.call(app, params.seouri);
            data.product = await app.$api.products.getBySeoUri(params.seouri);

            if(!data.product) {
                return;
            }

            // const opts = product_mixin.methods.buildSizeOptions(data.product);
            // data.sizeOptions = opts.sizeOpts;

            data.skuOptions = {};

            if(isObject(data.product) && Array.isArray(data.product.skus) && Array.isArray(data.product.attributes)) {
                // build the attribute lookup:
                const attributeLookup = {};

                data.product.attributes.map((obj) => {
                    attributeLookup[obj.id] = obj.label;
                });

                console.log("ATTR LOOKUP", attributeLookup)

                data.product.skus.forEach((obj) => {
                    if(Array.isArray(obj.attributes)) {
                        obj.attributes.forEach((attr) => {
                            const optionsLabel = attributeLookup[attr.optionId];

                            if(!data.skuOptions.hasOwnProperty(optionsLabel)) {
                                data.skuOptions[optionsLabel] = [];
                            }

                            data.skuOptions[optionsLabel].push(attr.value);
                        });
                    }
                });
            }

            console.log("SKU OPTS", data.skuOptions)
            // TODO: create select menus from these options

            return data;
        }
        catch(err) {
            console.log('Error getting product', err);
        }
    },

    created() {
        if(!this.product) {
            this.$errorMessage(
                this.$t('Product not found'),
                { closeOthers: true }
            );
        }
    },

    head() {
        return {
            title: this.productTitle,
            meta: [
                { vmid: 'description', name: 'description', content: this.productDesc },
                { name: 'og:site_name', content: this.$store.state.ui.siteName },
                { name: 'og:url', content: this.$route.fullPath },
                { name: 'og:title', content: this.productTitle },
                { name: 'og:type', content: 'website' },
                { name: 'og:image', content: this.mediaPicture },
                { name: 'og:description', content: this.product ? this.product.description_long: '' },
            ]
        };
    },

    methods: {
        addToCart: async function() {
            if (!this.selectedSize) {
                this.$errorMessage(
                    this.$t('Please select a size'),
                    { closeOthers: true }
                );
            }
            else if (!this.selectedQty) {
                this.$errorMessage(
                    this.$t('Please select a quantity'),
                    { closeOthers: true }
                );
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
};
</script>


<template>
    <div class="pageContainerMax">
        {{ skuOptions }}
        <product-details-layout v-if="product">
            <!-- pics -->
            <template slot="pics">
                <!-- <product-image-carousel :product="product" /> -->
            </template>

            <template slot="info">
                <!-- title -->
                <div class="fs20 pbm">{{ product.title }}</div>

                <!-- description -->
                <div class="fs16 wordBreakBreakWord">{{ product.description }}</div>

                <!-- price -->
                <div class="mtl fs20">
                    <!-- <product-price :product="product"></product-price> -->
                </div>

                <hr/>

                <!-- TODO -->
                <div v-for="(attr, index) in product.attributes" :key="index" class="mbm">
                    <label>{{ attr.label }}:</label>
                    <div>
                        <product-attribute-selector
                            v-model="attr.value"
                            :attribute="attr"
                            :skus="product.skus" />
                    </div>
                </div>

                <!-- size -->
                <!-- <div class="mbl">
                    <div class="fwb mbs">{{ $t('Size') }}:</div>
                    <product-size-buttons
                        v-model="selectedSize"
                        @input="onSizeChange"
                        :product="product" />
                </div> -->

                <!-- quantity -->
                <!-- <div v-if="sizeOptions.length" style="max-width:175px">
                    <div class="mbs">
                        <span class="fwb">{{ $t('Quantity') }}:</span>
                        <span class="plm"><product-quantity-warning :max="productQuantityMaxValue" /></span>
                    </div>
                    <number-input
                        v-model="selectedQty"
                        :min="1"
                        :max="productQuantityMaxValue" />
                </div> -->

                <!-- add to cart button -->
                <div class="tac ptxl">
                    <!-- <el-button
                        type="primary"
                        @click="addToCart"
                        :loading="isLoading"
                        :disabled="!sizeOptions.length"
                        round
                        class="is-huge">{{ $t('Add To Your Order') }}</el-button> -->
                </div>
            </template>

            <!-- size chart -->
            <!-- <div slot="under"
                 class="ptxl"
                 v-if="showSizeChart">
                <div class="fs16 mbm">{{ $t('Sizing') }}:</div>
                <tshirt-size-chart
                    :fit="product.fit"
                    :material="product.material_type"
                    :highlight="selectedSize" />
            </div> -->
        </product-details-layout>
    </div>
</template>

