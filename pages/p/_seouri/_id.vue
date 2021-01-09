<script>
import isObject from 'lodash.isobject';
import { email, required } from 'vuelidate/lib/validators'
import product_mixin from '@/mixins/product_mixin';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';
import ProductPrice from '@/components/product/ProductPrice';
import ProductQuantityWarning from '@/components/product/ProductQuantityWarning';
import ProductDetailsLayout from '@/components/product/ProductDetailsLayout';
import ProductImageSlider from '@/components/product/ProductImageSlider';
import ProductCardThumbs from '@/components/product/ProductCardThumbs';
import ProductSizeButtons from '@/components/product/ProductSizeButtons';
// import TshirtSizeChart from '@/components/product/TshirtSizeChart';

import {
    FigButton,
    FigOverlay
} from '@notoursllc/figleaf';

export default {
    components: {
        FigButton,
        FigOverlay,
        ProductPrice,
        ProductQuantityWarning,
        ProductDetailsLayout,
        ProductImageSlider,
        ProductCardThumbs,
        ProductSizeButtons
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
            isLoading: false,
            cartButtonLoading: false,
            selectedSkuInventoryCount: null,
            form: {
                selectedSku: null
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
                //     size: this.form.selectedSku,
                //     qty: this.form.selectedQty
                // }
            };

            try {
                const sku = await this.$api.products.getVariantSku(route.params.id);

                // const response = await this.addItem(addItemConfig);
                // this.setCartAndTokenStateFromResponse(response);

                // this.$nuxt.$emit('PRODUCT_ADDED_TO_CART', this.product);
            }
            catch(err) {
                this.$errorMessage(
                    err.response.data.message,
                );

                this.$bugsnag.notify(err, {
                    request: {
                        addItem: addItemConfig
                    }
                });
            }

            this.isLoading = false;
        },

        onThumbClick(variant) {
            // console.log("ON THUMNB CLIKC", variant)
            this.setVisibleVariant(variant);
            this.$refs.slider.goTo(0);
        },

        async onSizeSelect(sku) {
            this.form.selectedSku = sku;


            console.log("SIZE CHANGE", sku)

            this.cartButtonLoading = true;
            await this.getSkuInventoryCount(sku.id);
            this.cartButtonLoading = false;
        },

        setVisibleVariant(variant) {
            this.visibleVariant = variant || {};
        },

        async getSkuInventoryCount(id) {
            try {
                const sku = await this.$api.products.getVariantSku(id);
                this.selectedSkuInventoryCount = isObject(sku) ? sku.inventory_count : 0;
            }
            catch(err) {
                this.$errorMessage(
                    err.response.data.message,
                );

                this.$bugsnag.notify(err);
            }
        }
    }
};
</script>


<template>
    <div class="pageContainerMax container-fluid">
        form {{ form }}
        <product-details-layout v-if="product">
            <!-- pics -->
            <template slot="pics">
                <client-only placeholder="Carousel loading...">
                    <product-image-slider
                        ref="slider"
                        :product="product"
                        :variant-id="visibleVariant.id" />
                </client-only>
            </template>

            <template slot="title">{{ product.title }}</template>

            <template slot="description">{{ product.description }}</template>

            <template slot="price">
                <product-price
                    :variant="visibleVariant"
                    :sku="form.selectedSku" />
            </template>

            <template slot="thumbs">
                <product-card-thumbs
                    :product="product"
                    :width="70"
                    :selected="visibleVariant.id"
                    @click="onThumbClick" />
            </template>

            <template slot="sizes">
                <product-quantity-warning
                    :qty="visibleVariant.total_inventory_count" />

                <div class="mtl">
                    <div class="flex items-center font-medium mb-1 w-full">
                        <div class="text-black flex-grow">{{ $t('Select a size') }}:</div>
                        <div class="text-gray-500">{{ $t('Size guide') }}</div>
                    </div>

                    <product-size-buttons
                        :product="product"
                        :variant-id="visibleVariant.id"
                        @input="onSizeSelect" />
                </div>
            </template>

            <template slot="button">
                <fig-overlay :show="cartButtonLoading">
                    <div v-if="!visibleVariant">Unavailable</div>
                    <template v-else>
                        <div v-if="!visibleVariant.total_inventory_count || (selectedSkuInventoryCount !== null && selectedSkuInventoryCount < 1)">
                            <fig-button
                            variant="danger"
                            :disabled="true"
                            size="lg"
                            class="w-full block">{{ $t('Out of stock') }}</fig-button>
                        </div>

                        <fig-button
                            v-else
                            variant="success"
                            size="lg"
                            class="w-full block"
                            @click="addToCart"
                            :loading="isLoading">{{ $t('Add To Your Order') }}</fig-button>
                    </template>
                </fig-overlay>
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
