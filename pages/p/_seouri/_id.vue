<script>
import isObject from 'lodash.isobject';
import { email, required } from 'vuelidate/lib/validators'
import product_mixin from '@/mixins/product_mixin';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';
import { arraysAreEqual } from '@/utils/common';
import ProductPrice from '@/components/product/ProductPrice';
import ProductQuantityWarning from '@/components/product/ProductQuantityWarning';
import ProductDetailsLayout from '@/components/product/ProductDetailsLayout';
import ProductImageSlider from '@/components/product/ProductImageSlider';
import ProductAttributeSelector from '@/components/product/ProductAttributeSelector';
import ProductCardThumbs from '@/components/product/ProductCardThumbs';
// import TshirtSizeChart from '@/components/product/TshirtSizeChart';

import {
    FigButton
} from '@notoursllc/figleaf';

const slideBreakpoint = 1024;

export default {
    components: {
        FigButton,
        ProductPrice,
        ProductQuantityWarning,
        ProductDetailsLayout,
        ProductImageSlider,
        ProductAttributeSelector,
        ProductCardThumbs
    },

    mixins: [
        product_mixin,
        shopping_cart_mixin
    ],

    data() {
        return {
            product: {},
            visibleVariant: {},

            // skuOptions: {},
            selectedAttributes: {},
            selectedAttributesAreValid: false,
            productQuantityMaxValue: 30,
            isLoading: false,
            form: {
                selectedSize: null,
                selectedQty: 1
            }
        };
    },

    validations: function() {

        // let baseValidation = {
        //     countryCodeAlpha2: { required },
        //     firstName: { required },
        //     lastName: { required },
        //     streetAddress: { required },
        //     extendedAddress: {}, // no validation needed
        //     city: { required },
        //     state: { required },
        //     postalCode: { required },
        //     company: {} // no validation needed
        // }

        // if(this.type === 'shipping') {
        //     baseValidation.email = { required, email }
        // }

        // return {
        //     form: baseValidation
        // }
    },

    fetchOnServer: true,

    async asyncData({ route, store, app }) {
        try {
            const data = {};
            // data.product = await product_mixin.methods.getProductBySeoUri.call(app, params.seouri);
            data.product = await app.$api.products.get(route.params.id);

            // if(!data.product) {
            //     return;
            // }

            if(route.query.variant && Array.isArray(data.product.variants)) {
                for(let i=0, l=data.product.variants.length; i<l; i++) {
                    if(data.product.variants[i].id === route.query.variant) {
                        data.visibleVariant = data.product.variants[i];
                        break;
                    }
                }
            }

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
            this.isLoading = true;

            const addItemConfig = {
                product: this.product.id,
                sku: this.visibleVariant.id
                // options: {
                //     size: this.form.selectedSize,
                //     qty: this.form.selectedQty
                // }
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
        },

        onSizeChange(newVal) {
            const inventoryCount = this.getInventoryCountForSize(newVal, this.product);

            if(inventoryCount) {
                this.productQuantityMaxValue = inventoryCount;

                if(inventoryCount < this.form.selectedQty) {
                    this.form.selectedQty = this.productQuantityMaxValue;
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
            this.product.variants.forEach((sku) => {
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
            this.visibleVariant = sku || {};
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
                    <product-image-slider
                        :product="product"
                        :variant-id="visibleVariant.id" />
                </client-only>
            </template>

            <template slot="title">{{ product.title }}</template>

            <template slot="description">{{ product.description }}</template>

            <template slot="price">
                <product-price :sku="visibleVariant"></product-price>
            </template>

            <template slot="thumbs">
                <product-card-thumbs
                    :product="product"
                    :width="70"
                    :selected="visibleVariant.id"
                    @click="onThumbClick" />
            </template>

            <template slot="attributes">
                <product-quantity-warning
                    :qty="visibleVariant.total_inventory_count"
                    class="mbm" />

                <div v-for="(attr, index) in product.attributes" :key="index" class="mbm">
                    <label class="font-semibold">{{ attr.label }}:</label>
                    <div>
                        <product-attribute-selector
                            class="product-attribute-select"
                            v-model="attr.value"
                            :attribute="attr"
                            :skus="product.variants"
                            @input="(val) => { onAttributeChange(attr, val) }" />
                    </div>
                </div>
            </template>

            <template slot="button">
                <div v-if="!visibleVariant">Unavailable</div>
                <template v-else>
                    <template v-if="!visibleVariant.total_inventory_count">{{ $t('Out of stock') }}</template>
                    <fig-button
                        v-else
                        variant="success"
                        size="lg"
                        class="w-full block"
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
</style>
