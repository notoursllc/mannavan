<script>
import isObject from 'lodash.isobject';
import product_mixin from '@/mixins/product_mixin';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';
import { arraysAreEqual } from '@/utils/common';


export default {
    components: {
        ProductPrice: () => import('@/components/product/ProductPrice'),
        ProductQuantityWarning: () => import('@/components/product/ProductQuantityWarning'),
        ProductDetailsLayout: () => import('@/components/product/ProductDetailsLayout'),
        ProductImageCarousel: () => import('@/components/product/ProductImageCarousel'),
        ProductSizeButtons: () => import('@/components/product/ProductSizeButtons'),
        ProductAttributeSelector: () => import('@/components/product/ProductAttributeSelector'),
        TshirtSizeChart: () => import('@/components/product/TshirtSizeChart'),
        NumberInput: () => import('@/components/NumberInput'),
        QuantityButton: () => import('@/components/product/QuantityButton')
    },

    mixins: [
        product_mixin,
        shopping_cart_mixin
    ],

    data() {
        return {
            product: {},
            featuredImages: [],
            skuOptions: {},
            selectedAttributes: {},
            selectedAttributesAreValid: false,
            userSelectedSku: null,

            selectedSize: null,
            selectedQty: 1,
            productQuantityMaxValue: 30,
            isLoading: false,
            siteUrl: this.$store.state.ui.siteUrlLong,
            pageUrl: `${this.$store.state.ui.siteUrlLong}${this.$route.fullPath}`,
            twitterUser: this.$store.state.ui.twitterUser,
            selectedQty: 1
        };
    },

    async asyncData({ params, store, app }) {
        try {
            const data = {};
            // data.product = await product_mixin.methods.getProductBySeoUri.call(app, params.seouri);
            data.product = await app.$api.products.get(params.id);

            if(!data.product) {
                return;
            }

            data.featuredImages = product_mixin.methods.prodMix_getFeaturedSkuImagesForProduct(data.product);

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

    computed: {

        /**
         * Checks to see if the selected attributes reporesent a sku
         */
        // selectedAttributesAreValid() {
        //     let isMatch = false;
        //     const selectedValues = [];

        //     for(let key in this.selectedAttributes) {
        //         selectedValues.push(this.selectedAttributes[key]);
        //     }

        //     // all of the selected values need to exist in a sku
        //     // in order the the selection to be valid
        //     this.product.skus.forEach((sku) => {
        //         const skuAttributeValues = sku.attributes.map(obj => obj.value);

        //         if(arraysAreEqual(skuAttributeValues.sort(), selectedValues.sort())) {
        //             isMatch = true;
        //         }
        //         console.log("match?", skuAttributeValues, selectedValues, isMatch)
        //     });

        //     return isMatch;
        // }
    },

    created() {
        console.log("ROUTE", this.$route)
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
            //test
            console.log("addToCart");
            return;

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
        },


        onAttributeChange(attribute, value) {
            // TODO: display pics of the selected sku
            this.selectedAttributes[attribute.id] = attribute.value;

            let selected = null;
            const selectedValues = [];

            for(let key in this.selectedAttributes) {
                selectedValues.push(this.selectedAttributes[key]);
            }

            // all of the selected values need to exist in a sku
            // in order the the selection to be valid
            this.product.skus.forEach((sku) => {
                const skuAttributeValues = sku.attributes.map(obj => obj.value);
                if(arraysAreEqual(skuAttributeValues.sort(), selectedValues.sort())) {
                    selected = sku;
                }
            });

            this.userSelectedSku = selected;
        },

        onThumbMouseOver(obj) {
            // this.setVisibleSku(obj.sku);
            console.log("THUMB MOUSE OVER", obj)
        }
    }
};
</script>


<template>
    <div class="pageContainerMax container-fluid px-xl-7 pt-5 pb-3 pb-lg-6">
        <div class="row">
            <div class="col-lg-6 col-xl-8 pt-4 order-2 order-lg-1 photoswipe-gallery">
                <div class="grid-image">img</div>
                <div class="grid-image">img</div>
                <div class="grid-image">img</div>
                <div class="grid-image">img</div>
                <div class="grid-image">img</div>
            </div>

            <div class="col-lg-6 col-xl-4 pt-4 order-1 order-lg-2">right</div>
        </div>


        {{ skuOptions }}
        <product-details-layout v-if="product">
            <!-- pics -->
            <template slot="pics">
                <!-- <product-image-carousel :product="product" /> -->
                <!-- <div class="d-flex align-content-stretch flex-wrap widthAll">
                    <div class="w-50 p-2" style="border:1px solid blue">img</div>
                    <div class="w-50 p-2" style="border:1px solid blue">img</div>
                    <div class="w-50 p-2" style="border:1px solid blue">img</div>
                    <div class="w-50 p-2" style="border:1px solid blue">img</div>
                </div> -->

                <!-- <div class="grid-image-container">
                    <div class="grid-image">img</div>
                    <div class="grid-image">img</div>
                    <div class="grid-image">img</div>
                    <div class="grid-image">img</div>
                    <div class="grid-image">img</div>
                </div> -->

                <!-- <div class="container-fluid">
                    <div class="row row-cols-md-2 row-cols-sm-1">
                        <div class="" style="border:1px solid blue">img</div>
                        <div class="" style="border:1px solid blue">img</div>
                        <div class="" style="border:1px solid blue">img</div>
                        <div class="" style="border:1px solid blue">img</div>
                        <div class="" style="border:1px solid blue">img</div>
                    </div>
                </div> -->
            </template>

            <template slot="info">
                <!-- title -->
                <div class="prod-title">{{ product.title }}</div>

                <!-- price -->
                <div class="mtm mbm fs20">
                    price goes here
                    <!-- <product-price :product="product"></product-price> -->
                </div>

                <div v-for="(obj, index) in featuredImages"
                     :key="index"
                     class="media-thumb">

                    <PiioElement
                        :path="obj.url"
                        tag="div"
                        :id="`thumb_${index}`"
                        class="thumbImg"
                        @mouseover="onThumbMouseOver(obj)"></PiioElement>

                    <!-- <b-tooltip
                        :disabled="obj.sku.inventory_count > 0"
                        :target="`thumb_${index}`">{{ $t('Sold out') }}</b-tooltip> -->
                </div>

                <!-- TODO -->
                <div v-for="(attr, index) in product.attributes" :key="index" class="mbm">
                    <label class="fs12">{{ attr.label }}:</label>
                    <div>
                        <product-attribute-selector
                            v-model="attr.value"
                            :attribute="attr"
                            :skus="product.skus"
                            @input="(val) => { onAttributeChange(attr, val) }" />
                    </div>
                </div>

                <div e-else class="tac ptl">
                    <div v-if="!userSelectedSku">Unavailable</div>
                    <template v-else>
                        <template v-if="!userSelectedSku.inventory_count">{{ $t('Out of stock') }}</template>
                        <quantity-button
                            v-else
                            v-model="selectedQty"
                            @click="addToCart"
                            :loading="isLoading">{{ $t('Add To Your Order') }}</quantity-button>
                    </template>
                </div>

                <!-- description -->
                <div class="fs16 wordBreakBreakWord mtxl">{{ product.description }}</div>

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

<style lang="scss">
@import '~assets/css/components/_variables.scss';
@import "~assets/css/components/_mixins.scss";

.grid-image-container {
    width: 100%;
    margin: 0;
    padding: 0;

    .grid-image {
        width: 49%;
        background-color: #ccc;
        display: inline-block;
        margin: 0;
        padding: 0;
    }
}

@media #{$small-and-down} {
    .grid-image-container {
        .grid-image {
            width: 100%;
            // display: block;
        }
    }
 }

@media #{$medium-and-down} {
    .prod-card-container {
        padding: 20px;
    }

    .flex-container-column {
        width: 50%;
    }
}

.media-thumb {
    margin: 0 3px 3px 3px;
    display: inline-block;
    width: 70px;
    height: 70px;

    .thumbImg {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        background-size: cover;
        background-position: center;
        display: inline-block;
    }
}



.prod-title {
    font-size: 24px;
    font-weight: 500;
}
</style>

