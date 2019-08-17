<script>
import isObject from 'lodash.isobject';
import _forEach from 'lodash.foreach';
import product_mixin from '@/mixins/product_mixin';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';

const globalTypes = process.env.GLOBAL_TYPES;

export default {
    props: {
        product: {
            type: Object,
            required: true
        }
    },

    components: {
        ProductPrice: () => import('@/components/product/ProductPrice'),
        ProductQuantityInput: () => import('@/components/product/ProductQuantityInput'),
        ProductDetailsLayout: () => import('@/components/product/details/ProductDetailsLayout'),
        ProductImageCarousel: () => import('@/components/product/ProductImageCarousel'),
        TshirtSizeChart: () => import('@/components/product/TshirtSizeChart')
    },

    data() {
        return {
            selectedSize: null,
            selectedQty: 1,
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

console.log("ADDED RESPONSE", response)
                    this.$emit('addedToCart', this.product)
                    return;
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

            <!-- title -->
            <div slot="title">{{ product.title }}</div>

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
                <el-select
                    v-model="selectedSize"
                    :no-data-text="$t('Sorry this item does not have any sizes available')"
                    placeholder="Select a Size"
                    class="widthAll">
                    <el-option
                        v-for="size in sizeOptions"
                        :key="size"
                        :label="$t(size)"
                        :value="size" />
                </el-select>
            </template>

            <!-- quantity -->
            <template slot="quantity" v-if="sizeOptions.length">
                <product-quantity-input
                    v-model="selectedQty"
                    :sizes="product.sizes"
                    :selected-size="selectedSize" />
            </template>

            <!-- add to cart button -->
            <div slot="button" class="ptl">
                <el-button
                    type="primary"
                    @click="addToCart"
                    :loading="isLoading"
                    :disabled="!sizeOptions.length"
                    round>{{ $t('Add To Your Order') }}</el-button>
            </div>

            <!-- size chart -->
            <div slot="under"
                class="ptl"
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

