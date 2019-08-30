<script>
import forEach from 'lodash.foreach'
import product_mixin from '@/mixins/product_mixin'
import shipping_mixin from '@/mixins/shipping_mixin'

const globalTypes = process.env.GLOBAL_TYPES;

export default {
    middleware: 'authenticated',

    layout: 'admin',

    components: {
        ProductSizeAdmin: () => import('@/components/product/admin/ProductSizeAdmin'),
        ProductPicturesAdmin: () => import('@/components/product/admin/ProductPicturesAdmin'),
        BitwiseMultiSelect: () => import('@/components/BitwiseMultiSelect'),
        IconNewWindow: () => import('@/components/icons/IconNewWindow'),
        IconPlayVideo: () => import('@/components/icons/IconPlayVideo'),
        ProductArtistSelect: () => import('@/components/product/admin/ProductArtistSelect'),
        Fab: () => import('@/components/Fab')
    },

    mixins: [
        product_mixin,
        shipping_mixin
    ],

    data() {
        return {
            globalTypes: globalTypes,
            product: {
                sizes: []
            },
            productInfo: {},
            productPics: [],
            shippingPackageTypes: [],
            videoPlayerModal: {
                isActive: false,
                videoId: null,
                player: null,
            },
            pictureUpsertModal: {
                isActive: false,
            }
        }
    },

    computed: {
        typeSelectOptions() {
            let opts = {};
            let self = this;
            forEach(this.productInfo.types, function(val, key) {
                opts[self.$t(key)] = val;
            });
            return opts;
        },

        subTypeSelectOptions() {
            let opts = {};
            let self = this;
            forEach(this.productInfo.subTypes, function(val, key) {
                opts[self.$tc(key, 2)] = val;
            });
            return opts;
        },

        fitSelectOptions() {
            let opts = {};
            let self = this;
            forEach(this.productInfo.fits, function(val, key) {
                opts[self.$t(key)] = val;
            });
            return opts;
        },

        productSizes() {
            return this.product.sizes;
        }
    },

    methods: {
        async getProduct() {
            try {
                const product = await this.getProductById(this.$route.params.id, { viewAllRelated: true });

                if(!product) {
                    throw new Error(this.$t('Product not found'));
                }

                return product;
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        goToStore(seoUri) {
            let routeData = this.$router.resolve({
                name: 'p-seouri',
                params: { seouri: seoUri }
            });

            // this opens the page in a new tab
            window.open(routeData.href, '_blank');
        },

        playVideo(url) {
            let id = this.$youtube.getIdFromURL(url);
            if(id) {
                this.videoPlayerModal.videoId = id;
                this.videoPlayerModal.isActive = true;
            }
            else {
                this.videoPlayerModal.isActive = false;
            }
        },

        modalClosed() {
            if(this.videoPlayerModal.player) {
                this.videoPlayerModal.player.stopVideo();
            }
        },

        videoPlaying(player) {
            this.videoPlayerModal.player = player;
        },

        async upsert() {
            try {
                const p = await this.upsertProduct(this.product);

                if(!p) {
                    throw new Error('Error updating product');
                }

                let title = this.product.id ? 'Product updated successfully' : 'Product added successfully';
                this.$successMessage(`${title}: ${p.title}`)
                this.goToAdminProductList();
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        }
    },

    async created() {
        try {
            if(this.$route.params.id) {
                this.product = await this.getProduct();
            }
            else {
                // setting some defaults:
                this.product.is_available = true;
                this.product.hide_if_out_of_stock = true;
            }

            this.productInfo = await this.getProductInfo();
            this.shippingPackageTypes = await this.getPackageTypes();

            if(!this.productInfo) {
                throw new Error(this.$t('Product info not found'));
            }
        }
        catch(e) {
            this.$errorMessage(
                e.message,
                { closeOthers: true }
            )
        }
    }
}
</script>


<template>
    <div>
        <fab type="save" @click="upsert" />
        <fab type="cancel" @click="goToAdminProductList" />

        <div class="tar mbm" v-if="product.id">
            <el-button @click="goToStore(product.seo_uri)">
                <icon-new-window icon-name="new_window" width="15px" />
                &nbsp;&nbsp;VIEW PRODUCT IN STORE
            </el-button>
        </div>

        <el-tabs type="card">

            <!-- general info -->
            <el-tab-pane
                label="General Info"
                class="phl">
                <div class="formContainer">
                    <!-- is_available -->
                    <div class="formRow">
                        <label>Available:</label>
                        <span>
                            <el-checkbox v-model="product.is_available" />
                        </span>
                    </div>

                    <!-- hide_if_out_of_stock -->
                    <div class="formRow">
                        <label>Hide if out of stock:</label>
                        <span>
                            <el-checkbox v-model="product.hide_if_out_of_stock" />
                        </span>
                    </div>

                    <!-- title -->
                    <div class="formRow">
                        <label>Title:</label>
                        <span>
                            <el-input v-model="product.title" />
                        </span>
                    </div>

                    <!-- description_short -->
                    <div class="formRow">
                        <label>Short Description:</label>
                        <span>
                            <el-input
                                type="textarea"
                                :rows="2"
                                v-model="product.description_short" />
                        </span>
                    </div>

                    <!-- description_long -->
                    <div class="formRow">
                        <label>Long Description:</label>
                        <span>
                            <el-input
                                type="textarea"
                                :rows="3"
                                v-model="product.description_long" />
                        </span>
                    </div>

                    <!-- seo_uri -->
                    <div class="formRow">
                        <label>SEO URI:</label>
                        <span>
                            <el-input v-model="product.seo_uri" />
                        </span>
                    </div>

                    <!-- weight_oz -->
                    <div class="formRow">
                        <label>Weight (oz):</label>
                        <span>
                            <el-input-number
                                v-model="product.weight_oz"
                                controls-position="right"
                                :step=".1"
                                class="widthAll" />
                        </span>
                    </div>

                    <!-- tax_code -->
                    <div class="formRow">
                        <label>Tax code:</label>
                        <span>
                            <el-input-number
                                v-model="product.tax_code"
                                controls-position="right"
                                :step="1"
                                class="widthAll" />
                        </span>
                    </div>

                    <!-- sku -->
                    <div class="formRow">
                        <label>SKU:</label>
                        <span>
                            <el-input v-model="product.sku" />
                        </span>
                    </div>

                    <!-- material type -->
                    <div class="formRow">
                        <label>Material type:</label>
                        <span>
                            <el-select
                                v-model="product.material_type"
                                class="widthAll"
                                :clearable="true"
                                @clear="() => { product.material_type = null }">
                                <el-option
                                    v-for="(val, key) in globalTypes.product.material_types"
                                    :key="val"
                                    :label="$t(key)"
                                    :value="val">
                                </el-option>
                            </el-select>
                        </span>
                    </div>

                    <!-- artist -->
                    <div class="formRow">
                        <label>Artist:</label>
                        <span>
                            <product-artist-select v-model="product.product_artist_id" />
                        </span>
                    </div>
                </div>
            </el-tab-pane>


            <!-- pricing -->
            <el-tab-pane
                label="Pricing"
                class="phl">
                <div class="formContainer">
                    <!-- cost -->
                    <div class="formRow">
                        <label>Cost:</label>
                        <span>
                            <el-input-number
                                v-model="product.cost"
                                controls-position="right"
                                :step=".01" />
                        </span>
                    </div>

                    <!-- base_price -->
                    <div class="formRow">
                        <label>Base price:</label>
                        <span>
                            <el-input-number
                                v-model="product.base_price"
                                controls-position="right"
                                :step=".01" />
                        </span>
                    </div>

                    <!-- sale_price -->
                    <div class="formRow">
                        <label>Sale price:</label>
                        <span>
                            <el-input-number
                                v-model="product.sale_price"
                                controls-position="right"
                                :step=".01" />
                        </span>
                    </div>

                    <!-- sale_price -->
                    <div class="formRow">
                        <label>On sale:</label>
                        <span>
                            <el-checkbox v-model="product.is_on_sale" />
                        </span>
                    </div>
                </div>
            </el-tab-pane>


            <!-- categories -->
            <el-tab-pane
                label="Categories"
                class="phl">
                <div class="formContainer">
                    <!-- type -->
                    <div class="formRow">
                        <label>Product type:</label>
                        <span>
                            <bitwise-multi-select
                                v-model="product.type"
                                :options="typeSelectOptions" />
                        </span>
                    </div>

                    <!-- sub_type -->
                    <div class="formRow">
                        <label>Product sub-type:</label>
                        <span>
                            <bitwise-multi-select
                                v-model="product.sub_type"
                                :options="subTypeSelectOptions" />
                        </span>
                    </div>

                    <!-- fits -->
                    <div class="formRow">
                        <label>Fit type:</label>
                        <span>
                            <bitwise-multi-select
                                v-model="product.fit"
                                :options="fitSelectOptions" />
                        </span>
                    </div>
                </div>
            </el-tab-pane>


            <!-- shipping -->
            <el-tab-pane
                label="Shipping"
                class="phl">
                <div class="formContainer">
                    <!-- package type -->
                    <div class="formRow">
                        <label>Shipping package type:</label>
                        <span>
                            <el-select
                                v-model="product.shipping_package_type"
                                :clearable="true"
                                @clear="() => { product.shipping_package_type = null }">
                                <el-option
                                    v-for="obj in shippingPackageTypes"
                                    :key="obj.id"
                                    :label="obj.label"
                                    :value="obj.type">
                                </el-option>
                            </el-select>
                        </span>
                    </div>
                </div>
            </el-tab-pane>


            <!-- sizes -->
            <el-tab-pane
                label="Sizes"
                :disabled="!product.id"
                class="phl">
                <product-size-admin :product-id="product.id" />
            </el-tab-pane>


            <!-- media -->
            <el-tab-pane
                label="Media"
                :disabled="!product.id"
                class="phl">
                <!-- video_url -->
                <div class="formRow">
                    <label>Video URL:</label>
                    <span>
                        <el-input v-model="product.video_url" style="width:600px">
                            <el-button
                                slot="append"
                                v-if="product.video_url"
                                @click="playVideo(product.video_url)">
                                <icon-play-video icon-name="play" width="20px" />
                            </el-button>
                        </el-input>
                    </span>
                </div>

                <!-- pictures -->
                <div class="mtl">
                    <product-pictures-admin :product-id="product.id"></product-pictures-admin>
                </div>

                <el-dialog title="Product video"
                        :visible.sync="videoPlayerModal.isActive"
                        @close="modalClosed"
                        width="90%"
                        top="5vh">
                    <no-ssr  placeholder="Loading...">
                        <youtube
                            :video-id="videoPlayerModal.videoId"
                            :player-vars="{ autoplay: 1 }"
                            player-width="100%"
                            @playing="videoPlaying"></youtube>
                    </no-ssr>
                </el-dialog>
            </el-tab-pane>

        </el-tabs>

    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_table.scss";
    @import "~assets/css/components/_formRow.scss";

    .prodPic {
        width: 400px;
    }

    .formContainer {
        width: 500px;

        .formRow > label {
            white-space: nowrap;
        }

        .formRow > span {
            width: 100%;
        }
    }
</style>
