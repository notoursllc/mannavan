<script>
import forEach from 'lodash.foreach'
import product_mixin from '@/mixins/product_mixin'
import shipping_mixin from '@/mixins/shipping_mixin'

export default {
    middleware: 'authenticated',

    layout: 'admin',

    components: {
        ProductSizeAdmin: () => import('@/components/product/admin/ProductSizeAdmin'),
        ProductTypeSelect: () => import('@/components/product/admin/ProductTypeSelect'),
        FitTypeSelect: () => import('@/components/product/admin/FitTypeSelect'),
        MaterialTypeSelect: () => import('@/components/product/admin/MaterialTypeSelect'),
        ProductPicturesAdmin: () => import('@/components/product/admin/ProductPicturesAdmin'),
        IconNewWindow: () => import('@/components/icons/IconNewWindow'),
        IconPlayVideo: () => import('@/components/icons/IconPlayVideo'),
        ProductArtistSelect: () => import('@/components/product/admin/ProductArtistSelect'),
        ProductVariationAdmin: () => import('@/components/product/admin/ProductVariationAdmin'),
        TaxSelect: () => import('@/components/tax/TaxSelect'),
        ShippingPackageTypeSelect: () => import('@/components/shipping/ShippingPackageTypeSelect'),
        Fab: () => import('@/components/Fab')
    },

    mixins: [
        product_mixin,
        shipping_mixin
    ],

    data() {
        return {
            product: {
                sizes: []
            },
            productPics: [],
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

        <div class="tar mbm" v-if="product.id">
            <el-button @click="goToStore(product.seo_uri)">
                <icon-new-window icon-name="new_window" width="15px" />
                &nbsp;&nbsp;VIEW PRODUCT IN STORE
            </el-button>
        </div>

        <el-tabs type="card">

            <!-- general info -->
            <el-tab-pane
                label="Product"
                class="phl">

                <div class="displayTable widthAll">
                    <div class="g-spec">
                        <div class="g-spec-label"></div>
                        <div class="g-spec-content">
                            <!-- is_available -->
                            <div class="formRow">
                                <label>Available:</label>
                                <span>
                                    <el-checkbox v-model="product.is_available" />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="g-spec">
                        <div class="g-spec-label">Categories</div>
                        <div class="g-spec-content">
                            <!-- type -->
                            <div class="formRow">
                                <label>Product type:</label>
                                <span>
                                    <product-type-select v-model="product.type" />
                                </span>
                            </div>

                            <!-- sub_type -->
                            <div class="formRow">
                                <label>Product sub-type:</label>
                                <span>
                                    <product-type-select
                                        v-model="product.sub_type"
                                        :is-sub-type="true" />
                                </span>
                            </div>

                            <!-- fits -->
                            <div class="formRow">
                                <label>Fit type:</label>
                                <span>
                                    <fit-type-select v-model="product.fit" />
                                </span>
                            </div>

                            <!-- material type -->
                            <div class="formRow">
                                <label>Material type:</label>
                                <span>
                                    <material-type-select v-model="product.material_type" />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="g-spec">
                        <div class="g-spec-label">Details</div>
                        <div class="g-spec-content">

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

                            <!-- tax_code -->
                            <!-- <div class="formRow">
                                <label>Tax code:</label>
                                <span>
                                    <el-input-number
                                        v-model="product.tax_code"
                                        controls-position="right"
                                        :step="1" />
                                </span>
                            </div> -->

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

                            <!-- artist -->
                            <div class="formRow">
                                <label>Artist:</label>
                                <span>
                                    <product-artist-select v-model="product.product_artist_id" />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="g-spec">
                        <div class="g-spec-label">Pricing</div>
                        <div class="g-spec-content">
                            <!-- Tax -->
                            <div class="formRow">
                                <label>Taxes:</label>
                                <span>
                                    <tax-select v-model="product.tax_id" />
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
                    </div>

                    <div class="g-spec">
                        <div class="g-spec-label">Shipping</div>
                        <div class="g-spec-content">
                            <!-- Package type -->
                            <div class="formRow">
                                <label>Package type:</label>
                                <span>
                                    <shipping-package-type-select v-model="product.shipping_package_type_id" />
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </el-tab-pane>

            <!-- variations -->
            <el-tab-pane
                label="Variations"
                :disabled="!product.id"
                class="phl">
                <template v-if="product.id">
                    <product-variation-admin :product-id="product.id" />
                </template>
            </el-tab-pane>

            <!-- sizes -->
            <el-tab-pane
                label="Sizes"
                :disabled="!product.id"
                class="phl">
                <product-size-admin :product-id="product.id" />
            </el-tab-pane>


            <!-- pictures -->
            <el-tab-pane
                label="Pictures"
                :disabled="!product.id"
                class="phl">
                <product-pictures-admin :product-id="product.id"></product-pictures-admin>
            </el-tab-pane>
        </el-tabs>


        <el-dialog title="Product video"
                :visible.sync="videoPlayerModal.isActive"
                @close="modalClosed"
                width="90%"
                top="5vh">
            <client-only  placeholder="Loading...">
                <youtube
                    :video-id="videoPlayerModal.videoId"
                    :player-vars="{ autoplay: 1 }"
                    player-width="100%"
                    @playing="videoPlaying"></youtube>
            </client-only>
        </el-dialog>

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
