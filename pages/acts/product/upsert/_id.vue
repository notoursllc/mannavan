<script>
import forEach from 'lodash.foreach';
import isObject from 'lodash.isobject';
import product_mixin from '@/mixins/product_mixin'
import shipping_mixin from '@/mixins/shipping_mixin'

export default {
    middleware: 'authenticated',

    layout: 'admin',

    components: {
        ProductSizeAdmin: () => import('@/components/product/admin/ProductSizeAdmin'),
        MasterTypeSelect: () => import('@/components/admin/MasterTypeSelect'),
        VendorSelect: () => import('@/components/product/admin/VendorSelect'),
        // MaterialTypeSelect: () => import('@/components/product/admin/MaterialTypeSelect'),
        // ProductPicturesAdmin: () => import('@/components/product/admin/ProductPicturesAdmin'),
        IconNewWindow: () => import('@/components/icons/IconNewWindow'),
        IconPlayVideo: () => import('@/components/icons/IconPlayVideo'),
        // VariationList: () => import('@/components/product/admin/variation/VariationList'),
        TaxSelect: () => import('@/components/tax/TaxSelect'),
        ShippingPackageTypeSelect: () => import('@/components/shipping/ShippingPackageTypeSelect'),
        Fab: () => import('@/components/Fab'),
        TextCard: () => import('@/components/TextCard'),
        InputMoney: () => import('@/components/admin/InputMoney'),
        CountrySelect: () => import('@/components/CountrySelect'),
        MetaDataBuilder: () => import('@/components/admin/MetaDataBuilder'),
        AttributeBuilder: () => import('@/components/product/admin/AttributeBuilder'),
    },

    mixins: [
        product_mixin,
        shipping_mixin
    ],

    data() {
        return {
            product: {},
            productHasOptions: false,
            domainName: process.env.DOMAIN_NAME,
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

    methods: {
        async getProduct(id) {
            try {
                const product = await this.$api.products.get(id, { viewAllRelated: true });

                if(!product) {
                    throw new Error(this.$t('Product not found'));
                }

                this.productHasOptions = product.attributes ? true : false;

                return product;
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        async upsert() {
            try {
                if(!this.productHasOptions) {
                    this.product.attributes = null;
                }
                const p = await this.$api.products.upsert(this.product);

                if(!p) {
                    throw new Error('Error updating product');
                }

                let title = p.id ? 'Product updated successfully' : 'Product added successfully';
                this.$successMessage(`${title}: ${p.title}`)
                this.goToAdminProductList();
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
        }
    },

    async mounted() {
        try {
            if(this.$route.params.id) {
                this.product = await this.getProduct(this.$route.params.id);
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
            <div class="textCardHeader">Organization</div>
            <div class="textCardContent">

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
                            v-model="product.sub_type"
                            object="product_sub_type" />
                    </div>

                    <!-- fit type -->
                    <div class="inputGroup mrl mbm">
                        <label>Fit type:</label>
                        <master-type-select
                            v-model="product.fit_type"
                            object="product_fit_type" />
                    </div>

                    <!-- sales channel -->
                    <div class="inputGroup mrl mbm">
                        <label>Sales channel:</label>
                        <master-type-select
                            v-model="product.sales_channel_type"
                            object="product_sales_channel_type" />
                    </div>

                    <!-- vendor -->
                    <div class="inputGroup mrl mbm">
                        <label>Vendor:</label>
                        <vendor-select v-model="product.vendor_id" />
                    </div>
                </div>
            </div>
        </text-card>


        <!-- General -->
        <text-card class="box-card mbl">
            <div class="textCardContent">
                <!-- published-->
                <div class="inputGroup mrl mbm">
                    <el-checkbox v-model="product.published">Published</el-checkbox>
                </div>

                <!-- page title -->
                <div class="inputGroup mrl mbm">
                    <label>Title</label>
                    <el-input
                        v-model="product.title"
                        maxlength="70"
                        show-word-limit />
                </div>

                <!-- caption -->
                <div class="inputGroup mrl mbm">
                    <label>Caption</label>
                    <el-input
                        v-model="product.caption"
                        maxlength="70"
                        show-word-limit />
                </div>

                <!-- description -->
                <div class="inputGroup mrl mbm">
                    <label>Description</label>
                    <el-input
                        v-model="product.description"
                        type="textarea"
                        :rows="2"
                        maxlength="320"
                        show-word-limit />
                </div>
            </div>
        </text-card>


        <!-- Options -->
        <text-card class="box-card mbl">
            <div class="textCardHeader">Options</div>
            <div class="textCardContent">
                <div class="inputGroup mrl mbm">
                    <el-checkbox v-model="productHasOptions">This product has multiple options, like different sizes or colors</el-checkbox>
                </div>

                <div v-if="productHasOptions">
                    <attribute-builder v-model="product.attributes" />
                </div>
            </div>
        </text-card>


        <!-- SEO -->
        <text-card class="box-card mbl">
            <div class="textCardHeader">Search engine listing</div>
            <div class="textCardContent">
                <!-- page title -->
                <div class="inputGroup mrl mbm">
                    <label>Page title</label>
                    <el-input
                        v-model="product.seo_page_title"
                        maxlength="70"
                        show-word-limit />
                </div>

                <!-- description -->
                <div class="inputGroup mrl mbm">
                    <label>Description</label>
                    <el-input
                        v-model="product.seo_page_desc"
                        type="textarea"
                        :rows="2"
                        maxlength="320"
                        show-word-limit />
                </div>

                <!-- URI -->
                <div class="inputGroup mrl mbm">
                    <label>URL and handle</label>
                    <el-input
                        v-model="product.seo_uri"
                        maxlength="50"
                        show-word-limit>
                        <template slot="prepend">https://{{ domainName }}/p/</template>
                    </el-input>
                </div>
            </div>
        </text-card>


        <!-- Images -->
        <text-card class="box-card mbl">
            <div class="textCardHeader">Images</div>
            <div class="textCardContent">
                <div class="inputGroupContainer">

                </div>
            </div>
        </text-card>


        <!-- Shipping -->
        <!-- <text-card class="box-card mbl">
            <div class="textCardHeader">Shipping</div>
            <div class="textCardContent">

                <div class="inputGroup mrl mbm">
                    <el-checkbox v-model="product.is_good">This is a physical product</el-checkbox>
                </div>

                <text-card-section class="mbl">
                    <h4 slot="header">CUSTOMS INFORMATION</h4>

                    <template slot="description">
                        Used by border officers to calculate duties when shipping internationally. Shown on customs forms you print during fulfillment.
                    </template>

                    <slot>
                        <div class="inputGroupContainer">

                            <div class="inputGroup mrl mbm">
                                <label>Country of origin</label>
                                <country-select v-model="product.foo" />
                            </div>
                        </div>
                    </slot>
                </text-card-section>
            </div>
        </text-card> -->


        <!-- Metadata -->
        <text-card class="box-card mbl">
            <div class="textCardHeader">Metadata</div>
            <div class="textCardContent">
                <meta-data-builder v-model="product.metadata" />
            </div>
        </text-card>


        <!-- Pricing -->
        <!-- <text-card class="box-card mbl">
            <div class="textCardHeader">Pricing</div>
            <div class="textCardContent">
                <div class="inputGroupContainer">

                    <div class="inputGroup mrl mbm">
                        <label>Price</label>
                        <input-money v-model="product.price" />
                    </div>

                </div>
            </div>
        </text-card> -->


        <!-- Inventory -->
        <!-- <text-card class="box-card mbl">
            <div class="textCardHeader">Inventory</div>
            <div class="textCardContent">
                <div class="inputGroupContainer">

                </div>
            </div>
        </text-card> -->
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
