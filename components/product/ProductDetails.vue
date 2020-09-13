<script>
import product_mixin from '@/mixins/product_mixin';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';
import ProductPrice from '@/components/product/ProductPrice';
import ProductQuantityWarning from '@/components/product/ProductQuantityWarning';
import ProductDetailsLayout from '@/components/product/ProductDetailsLayout';
import ProductImageCarousel from '@/components/product/ProductImageCarousel';
import ProductSizeButtons from '@/components/product/ProductSizeButtons';
import TshirtSizeChart from '@/components/product/TshirtSizeChart';
import NumberInput from '@/components/NumberInput';


export default {
    name: 'ProductDetails',

    components: {
        ProductPrice,
        ProductQuantityWarning,
        ProductDetailsLayout,
        ProductImageCarousel,
        ProductSizeButtons,
        TshirtSizeChart,
        NumberInput
    },

    mixins: [
        product_mixin,
        shopping_cart_mixin
    ],

    props: {
        product: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            selectedSize: null,
            selectedQty: 1,
            productQuantityMaxValue: 30,
            isLoading: false,
            siteUrl: this.$store.state.ui.siteUrlLong,
            pageUrl: `${this.$store.state.ui.siteUrlLong}${this.$route.fullPath}`,
            twitterUser: this.$store.state.ui.twitterUser
        };
    },

    computed: {
        showSizeChart() {
            return this.metaShowSizeChart(this.product.sub_type);
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
                <div class="fs16 wordBreakBreakWord">{{ product.description }}</div>

                <!-- price -->
                <div class="mtl fs20">
                    <product-price :product="product"></product-price>
                </div>

                <!-- attributes -->
                <div class="mtl fs20">
                    attrs
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
    </div>
</template>

