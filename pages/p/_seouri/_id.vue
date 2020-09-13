<script>
import isObject from 'lodash.isobject';
import product_mixin from '@/mixins/product_mixin';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';
import { arraysAreEqual } from '@/utils/common';
import ProductPrice from '@/components/product/ProductPrice';
import ProductQuantityWarning from '@/components/product/ProductQuantityWarning';
import ProductDetailsLayout from '@/components/product/ProductDetailsLayout';
import ProductImageCarousel from '@/components/product/ProductImageCarousel';
import ProductSizeButtons from '@/components/product/ProductSizeButtons';
import ProductAttributeSelector from '@/components/product/ProductAttributeSelector';
import ProductFeaturedImageThumbs from '@/components/product/ProductFeaturedImageThumbs';
// import TshirtSizeChart from '@/components/product/TshirtSizeChart';
import NumberInput from '@/components/NumberInput';
import QuantityButton from '@/components/product/QuantityButton';

export default {
    components: {
        ProductPrice,
        ProductQuantityWarning,
        ProductDetailsLayout,
        ProductImageCarousel,
        ProductSizeButtons,
        ProductAttributeSelector,
        ProductFeaturedImageThumbs,
        // TshirtSizeChart,
        NumberInput,
        QuantityButton
    },

    mixins: [
        product_mixin,
        shopping_cart_mixin
    ],

    data() {
        return {
            product: {},
            visibleSku: {},

            // skuOptions: {},
            selectedAttributes: {},
            selectedAttributesAreValid: false,
            userSelectedSku: null,

            selectedSize: null,
            selectedQty: 1,
            productQuantityMaxValue: 30,
            isLoading: false
        };
    },

    fetchOnServer: true,

    // fetch({ params, store, app }) {
    //     console.log("FETCH CONTEXT PARAMS", params)
    //     console.log("FETCH CONTEXT STORE", store)
    //     console.log("FETCH CONTEXT APP", app)
    // },

    computed: {
        visibleImages() {
            return this.prodMix_getSkuImages(this.visibleSku);
        }

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


    async asyncData({ route, store, app }) {
        try {
            const data = {};
            // data.product = await product_mixin.methods.getProductBySeoUri.call(app, params.seouri);
            data.product = await app.$api.products.get(route.params.id);

            // if(!data.product) {
            //     return;
            // }

            if(route.query.sku && Array.isArray(data.product.skus)) {
                // this.product.skus.forEach((sku) => {
                for(let i=0, l=data.product.skus.length; i<l; i++) {
                    if(data.product.skus[i].id === route.query.sku) {
                        data.visibleSku = data.product.skus[i];
                        break;
                    }
                }
            }

            // const opts = product_mixin.methods.buildSizeOptions(data.product);
            // data.sizeOptions = opts.sizeOpts;

/*
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
*/
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

        onThumbClick(sku) {
            this.visibleSku = sku || {};
        }
    }
};
</script>


<template>
    <div class="pageContainerMax container-fluid">
        <product-details-layout v-if="product">
            <!-- pics -->
            <template slot="pics">
                <picture v-for="(obj, index) in visibleImages">
                    <PiioElement :path="obj.url" tag="source" media="(max-width:969px)"></PiioElement>
                    <PiioElement :path="obj.url" tag="img"></PiioElement>
                </picture>
            </template>

            <template slot="title">{{ product.title }}</template>

            <template slot="description">{{ product.description }}</template>

            <template slot="price">
                <product-price :sku="visibleSku"></product-price>
            </template>

            <template slot="thumbs">
                <product-featured-image-thumbs
                    :product="product"
                    :width="70"
                    :selected="visibleSku.id"
                    @click="onThumbClick" />
            </template>

            <!-- TODO -->
            <template slot="attributes">
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
            </template>

            <template slot="button">
                <div v-if="!userSelectedSku">Unavailable</div>
                <template v-else>
                    <template v-if="!userSelectedSku.inventory_count">{{ $t('Out of stock') }}</template>
                    <quantity-button
                        v-else
                        v-model="selectedQty"
                        @click="addToCart"
                        :loading="isLoading">{{ $t('Add To Your Order') }}</quantity-button>
                </template>
            </template>
        </product-details-layout>
    </div>
</template>


<style lang="scss">
.grid-image {
    width: 49%;
    background-color: #ccc;
    display: inline-block;
    margin: 0;
    padding: 0;
}
</style>

