<script>
import isObject from 'lodash.isobject';
import FigButton from '@notoursllc/figleaf/components/button/FigButton.vue';
import product_mixin from '@/mixins/product_mixin';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';
import { arraysAreEqual } from '@/utils/common';
import ProductPrice from '@/components/product/ProductPrice';
import ProductQuantityWarning from '@/components/product/ProductQuantityWarning';
import ProductDetailsLayout from '@/components/product/ProductDetailsLayout';
import ProductImageCarousel from '@/components/product/ProductImageCarousel';
import ProductAttributeSelector from '@/components/product/ProductAttributeSelector';
import ProductFeaturedImageThumbs from '@/components/product/ProductFeaturedImageThumbs';
// import TshirtSizeChart from '@/components/product/TshirtSizeChart';

const slideBreakpoint = 1024;

export default {
    components: {
        FigButton,
        ProductPrice,
        ProductQuantityWarning,
        ProductDetailsLayout,
        ProductImageCarousel,
        ProductAttributeSelector,
        ProductFeaturedImageThumbs
    },

    mixins: [
        product_mixin,
        shopping_cart_mixin
    ],

    data() {
        return {
            product: {},
            visibleSku: {},
            visibleImages: [],

            // skuOptions: {},
            selectedAttributes: {},
            selectedAttributesAreValid: false,
            selectedSize: null,
            selectedQty: 1,
            productQuantityMaxValue: 30,
            isLoading: false,
            carouselOptions: {
                fade: false,
                responsive: [
                    {
                        breakpoint: 401
                    },
                    {
                        breakpoint: slideBreakpoint,
                        settings: {
                            unagile: true
                        }
                    }
                ]
            }
        };
    },

    fetchOnServer: true,

    // fetch({ params, store, app }) {
    //     console.log("FETCH CONTEXT PARAMS", params)
    //     console.log("FETCH CONTEXT STORE", store)
    //     console.log("FETCH CONTEXT APP", app)
    // },

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
                        data.visibleImages = product_mixin.methods.prodMix_getSkuImages(data.visibleSku);
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
            console.log("ON ATTR CHANGE", attribute, value);

            // TODO: display pics of the selected sku
            this.selectedAttributes[attribute.id] = attribute.value;

            const selectedValues = [];

            for(const key in this.selectedAttributes) {
                selectedValues.push(this.selectedAttributes[key]);
            }

            // all of the selected values need to exist in a sku
            // in order the the selection to be valid
            this.product.skus.forEach((sku) => {
                const skuAttributeValues = sku.attributes.map(obj => obj.value);
                if(arraysAreEqual(skuAttributeValues.sort(), selectedValues.sort())) {
                    // selected = sku;
                    this.setVisibleSku(sku);
                }
            });
        },

        onThumbClick(sku) {
            this.setVisibleSku(sku);

            const widthWindow = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            if(widthWindow <= slideBreakpoint) {
                setTimeout(() => {
                    this.$refs.carousel.goTo(0);
                    this.$refs.carousel.reload();
                }, 0);
            }
        },

        setVisibleSku(sku) {
            this.visibleSku = sku || {};
            this.visibleImages = this.prodMix_getSkuImages(this.visibleSku);
            console.log("setVisibleSku", sku);
        }
    }
};
</script>


<template>
    <div class="pageContainerMax container-fluid">
        <product-details-layout v-if="product">
            <!-- pics -->
            <template slot="pics">
                <client-only placeholder="Carousel loading...">
                    <product-image-carousel :options="carouselOptions" ref="carousel">
                        <picture
                            v-for="(obj, index) in visibleImages"
                            :key="index"
                            class="slide">
                            <PiioElement :path="obj.url" tag="source" media="(max-width:969px)"></PiioElement>
                            <PiioElement :path="obj.url" tag="img"></PiioElement>
                        </picture>

                        <div slot="prevButton" class="">
                            <fig-icon icon="chevron-left" width="24" height="24" />
                        </div>

                        <div slot="nextButton">
                            <fig-icon icon="chevron-right" width="24" height="24" />
                        </div>
                    </product-image-carousel>
                </client-only>
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

            <template slot="attributes">
                <product-quantity-warning
                    :qty="visibleSku.inventory_count"
                    class="mbm" />

                <div v-for="(attr, index) in product.attributes" :key="index" class="mbm">
                    <label class="attr-label">{{ attr.label }}:</label>
                    <div>
                        <product-attribute-selector
                            class="product-attribute-select"
                            v-model="attr.value"
                            :attribute="attr"
                            :skus="product.skus"
                            @input="(val) => { onAttributeChange(attr, val) }" />
                    </div>
                </div>
            </template>

            <template slot="button">
                <div v-if="!visibleSku">Unavailable</div>
                <template v-else>
                    <template v-if="!visibleSku.inventory_count">{{ $t('Out of stock') }}</template>
                    <fig-button
                        v-else
                        variant="success"
                        size="lg"
                        class="btn-add"
                        @click="addToCart"
                        :loading="isLoading">{{ $t('Add To Your Order') }}</fig-button>
                </template>
            </template>
        </product-details-layout>
    </div>
</template>


<style lang="scss">
.product-attribute-select {
    .vs__dropdown-toggle,
    .vs__selected {
        line-height: 2;
    }
}

.attr-label {
    font-weight: 600;
}

.btn-add {
    display: block;
    width: 100%;
}
</style>
