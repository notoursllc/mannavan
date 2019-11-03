<script>
import forEach from 'lodash.foreach';
import product_mixin from '@/mixins/product_mixin'
import shipping_mixin from '@/mixins/shipping_mixin'

export default {
    middleware: 'authenticated',

    layout: 'admin',

    components: {
        ProductSizeAdmin: () => import('@/components/product/admin/ProductSizeAdmin'),
        MasterTypeSelect: () => import('@/components/admin/MasterTypeSelect'),
        FitTypeSelect: () => import('@/components/product/admin/FitTypeSelect'),
        MaterialTypeSelect: () => import('@/components/product/admin/MaterialTypeSelect'),
        ProductPicturesAdmin: () => import('@/components/product/admin/ProductPicturesAdmin'),
        IconNewWindow: () => import('@/components/icons/IconNewWindow'),
        IconPlayVideo: () => import('@/components/icons/IconPlayVideo'),
        ProductArtistSelect: () => import('@/components/product/admin/ProductArtistSelect'),
        VariationList: () => import('@/components/product/admin/variation/VariationList'),
        TaxSelect: () => import('@/components/tax/TaxSelect'),
        ShippingPackageTypeSelect: () => import('@/components/shipping/ShippingPackageTypeSelect'),
        Fab: () => import('@/components/Fab'),
        TextCard: () => import('@/components/TextCard'),
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
                this.product.published = true;
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

        <text-card class="box-card mbl">
            <div slot="header">
                <span>Organization</span>
            </div>

            <slot>
                <div class="inputGroupContainer">
                    <!-- type -->
                    <div class="inputGroup mrl mbm">
                        <label>Product type:</label>
                        <master-type-select
                            v-model="product.type"
                            object="product_type" />
                    </div>

                    <!-- sub_type -->
                    <div class="inputGroup mrl mbm">
                        <label>Product sub-type:</label>
                        <master-type-select
                            v-model="product.type"
                            object="product_sub_type" />
                    </div>
                </div>
            </slot>
        </text-card>

        <!-- Images -->
        <text-card class="box-card mbl">
            <div slot="header">
                <span>Images</span>
            </div>

            <slot>
                <div class="inputGroupContainer">

                </div>
            </slot>
        </text-card>

        <!-- Pricing -->
        <text-card class="box-card mbl">
            <div slot="header">
                <span>Pricing</span>
            </div>

            <slot>
                <div class="inputGroupContainer">

                </div>
            </slot>
        </text-card>

        <!-- Inventory -->
        <text-card class="box-card mbl">
            <div slot="header">
                <span>Inventory</span>
            </div>

            <slot>
                <div class="inputGroupContainer">

                </div>
            </slot>
        </text-card>

        <!-- Shipping -->
        <text-card class="box-card mbl">
            <div slot="header">
                <span>Shipping</span>
            </div>

            <slot>
                <div class="inputGroupContainer">

                </div>
            </slot>
        </text-card>

        <!-- SKUs -->
        <text-card class="box-card mbl">
            <div slot="header">
                <span>SKUs</span>
            </div>

            <slot>
                <div class="inputGroupContainer">

                </div>
            </slot>
        </text-card>

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
