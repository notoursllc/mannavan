<script>
import forEach from 'lodash.foreach';
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';
import product_mixin from '@/mixins/product_mixin';
import shipping_mixin from '@/mixins/shipping_mixin';
import storage_mixin from '@/mixins/storage_mixin';


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
        ImageManager: () => import('@/components/product/admin/ImageManager'),
        SeoPreview: () => import('@/components/product/admin/SeoPreview'),
        SkuBuilder: () => import('@/components/product/admin/SkuBuilder'),
        SkuManager: () => import('@/components/product/admin/SkuManager')
    },

    mixins: [
        product_mixin,
        shipping_mixin,
        storage_mixin
    ],

    data() {
        return {
            loading: false,
            product: {
                attributes: [],
                skus: [],
                imagesTmp: []
            },
            productHasOptions: false,
            productHasMetaData: false,
            domainName: process.env.DOMAIN_NAME,
            imageManagerMaxImages: process.env.IMAGE_MANAGER_MAX_IMAGES || 8,
            videoPlayerModal: {
                isActive: false,
                videoId: null,
                player: null,
            }
        }
    },

    methods: {
        async fetchProduct() {
            let id = this.$route.params.id;
            this.loading = true;

            try {
                const product = await this.$api.products.get(id, { viewAllRelated: true });

                if(!product) {
                    throw new Error(this.$t('Product not found'));
                }

                this.productHasOptions = product.attributes ? true : false;
                this.productHasMetaData = product.metadata ? true : false;
                this.product = product;
                this.product.imagesTmp = [];

                // copy the product images into the tmp array so they display in the image manager
                if(Array.isArray(this.product.images)) {
                    this.product.images.forEach((arr) => {
                        this.product.imagesTmp.push(arr[0]);
                    });
                }

                // copy the product sku images into the tmp array so they display in the image manager
                if(Array.isArray(this.product.skus)) {
                    this.product.skus.forEach((obj) => {
                        obj.imagesTmp = [];

                        if(Array.isArray(obj.images)) {
                            obj.images.forEach((arr) => {
                                obj.imagesTmp.push(arr[0]);
                            });
                        }
                    });
                }

                console.log("FETCH PRODUCT DONE", this.product)
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }

            this.loading = false;
        },


        async upsertSkuImages() {
            if(Array.isArray(this.product.skus)) {
                for(let i=0, len=this.product.skus.length; i<len; i++) {
                    let obj = this.product.skus[i];
                    let copy = cloneDeep(obj.imagesTmp);
                    delete obj.imagesTmp;

                    if(Array.isArray(copy)) {
                        let result = await this.storagemix_uploadImages(copy);
                        console.log("upsertSKUImages", copy, result)

                        // 'result' only contains the new images that were added (not the pre-existing ones)
                        // so if there are pre-existing images, we just concat the new ones to the list
                        // otherwise we set the images data to the result
                        obj.images = Array.isArray(obj.images) ? obj.images.concat(result) : result;
                    }
                }
            }

            console.log("upsertSKUImages DONE", this.product.skus)
        },


        async deleteOldSkuImages() {
            if(Array.isArray(this.product.skus)) {
                for(let i=0, len=this.product.skus.length; i<len; i++) {
                    let obj = this.product.skus[i];
                    let copy = cloneDeep(obj.imagesTmp);
                    await this.storagemix_deleteProductImages(obj.imagesTmp, obj.images);
                }
            }
        },


        async upsertProductImages() {
            let copy = cloneDeep(this.product.imagesTmp);
            delete this.product.imagesTmp;

            if(Array.isArray(copy)) {
                const result = await this.storagemix_uploadImages(copy);
                console.log("upsertProductImages", copy, result)
                this.product.images = Array.isArray(this.product.images) ? this.product.images.concat(result) : result;
            }

            console.log("upsertProductImages DONE", this.product.images)
        },


        async onSaveClick() {
            // Delete the unused images
            try {
                await Promise.all([
                    this.deleteOldSkuImages(),
                    this.storagemix_deleteProductImages(this.product.imagesTmp, this.product.images)
                ]);
            }
            catch(err) {
                console.error(err)
                this.$bugsnag.notify(err);
            }
            return;

            console.log("ON SAVE", this.product);

            try {
                if(!this.productHasOptions) {
                    this.product.attributes = null;
                }

                if(!this.productHasMetaData) {
                    this.product.metadata = null;
                }

                await Promise.all([
                    this.upsertProductImages(),
                    this.upsertSkuImages()
                ]);

                console.log("BEFORE SAVE", this.product)

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

        onOptionsMutated() {
            this.fetchProduct();
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

    mounted() {
        try {
            if(this.$route.params.id) {
                this.fetchProduct();
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
    <div v-loading="loading">
        <!-- <div class="tar mbm" v-if="product.id">
            <el-button @click="goToStore(product.seo_uri)">
                <icon-new-window icon-name="new_window" width="15px" />
                &nbsp;&nbsp;VIEW PRODUCT IN STORE
            </el-button>
        </div> -->

        <!-- published-->
        <div class="mbl">
            <el-checkbox
                v-model="product.published"
                border>{{ $t('This product is available for purchase') }}</el-checkbox>
        </div>


        <text-card>
            <div slot="header">{{ $t('Organization') }}</div>

            <div class="inputGroupContainer">
                <!-- type -->
                <div class="inputGroup mrl mbm">
                    <label>{{ $t('Product type') }}</label>
                    <master-type-select
                        v-model="product.type"
                        object="product_type" />
                </div>

                <!-- sub_type -->
                <div class="inputGroup mrl mbm">
                    <label>{{ $t('Product sub-type') }}</label>
                    <master-type-select
                        v-model="product.sub_type"
                        object="product_sub_type" />
                </div>

                <!-- fit type -->
                <div class="inputGroup mrl mbm">
                    <label>{{ $t('Fit type') }}</label>
                    <master-type-select
                        v-model="product.fit_type"
                        object="product_fit_type" />
                </div>

                <!-- sales channel -->
                <div class="inputGroup mrl mbm">
                    <label>{{ $t('Sales channel') }}</label>
                    <master-type-select
                        v-model="product.sales_channel_type"
                        object="product_sales_channel_type" />
                </div>

                <!-- vendor -->
                <div class="inputGroup mrl mbm">
                    <label>{{ $t('Vendor') }}</label>
                    <vendor-select v-model="product.vendor_id" />
                </div>
            </div>
        </text-card>


        <!-- Details -->
        <text-card>
            <div slot="header">{{ $t('Details') }}</div>

            <!-- page title -->
            <div class="inputGroup mrl mbm">
                <label>{{ $t('Title') }}</label>
                <el-input
                    v-model="product.title"
                    maxlength="70"
                    show-word-limit />
            </div>

            <!-- caption -->
            <div class="inputGroup mrl mbm">
                <label>{{ $t('Caption') }}</label>
                <el-input
                    v-model="product.caption"
                    maxlength="70"
                    show-word-limit />
            </div>

            <!-- description -->
            <div class="inputGroup mrl mbm">
                <label>{{ $t('Description') }}</label>
                <el-input
                    v-model="product.description"
                    type="textarea"
                    :rows="2"
                    maxlength="320"
                    show-word-limit />
            </div>
        </text-card>


        <!-- Images -->
        <text-card>
            <div slot="header">
                {{ $t('Images') }}
                <span class="fs11 plm">{{ $t('You can add up to num images', {number: imageManagerMaxImages}) }}</span>
            </div>
            <image-manager
                v-model="product.imagesTmp"
                :max-num-images="parseInt(imageManagerMaxImages, 10)" />
        </text-card>


        <!-- Options -->
        <text-card>
            <div slot="header">{{ product.id ? $t('Variants') : $t('Options')  }}</div>

            <template v-if="product.id">
                <sku-manager
                    :product="product"
                    @optionUpdated="onOptionsMutated"
                    @optionDeleted="onOptionsMutated" />
            </template>

            <template v-else>
                <div class="inputGroup mrl mbm">
                    <el-checkbox v-model="productHasOptions">This product has multiple options, like different sizes or colors</el-checkbox>
                </div>

                <div v-if="productHasOptions">
                    <sku-builder
                        :product="product"
                        :max-count="3"
                        :suggestions="[
                            this.$t('Size'),
                            this.$t('Color'),
                            this.$t('Material')
                        ]" />

                    <!-- test -->
                    <div class="sku-preview" v-show="product.attributes.length">
                        <div class="pvm"><hr/></div>

                        <h4>{{ $t('VARIANTS') }}</h4>

                        <sku-manager
                            :product="product"
                            :details-view="true" />
                    </div>
                </div>
            </template>
        </text-card>


        <!-- SEO -->
        <text-card>
            <div slot="header">{{ $t('Search engine listing') }}</div>

            <!-- page title -->
            <div class="inputGroup mrl mbm">
                <label>{{ $t('Page title') }}</label>
                <el-input
                    v-model="product.seo_page_title"
                    maxlength="70"
                    show-word-limit />
            </div>

            <!-- description -->
            <div class="inputGroup mrl mbm">
                <label>{{ $t('Description') }}</label>
                <el-input
                    v-model="product.seo_page_desc"
                    type="textarea"
                    :rows="2"
                    maxlength="320"
                    show-word-limit />
            </div>

            <!-- URI -->
            <div class="inputGroup mrl mbm">
                <label>{{ $t('URL and handle') }}</label>
                <el-input
                    v-model="product.seo_uri"
                    maxlength="50"
                    show-word-limit>
                    <template slot="prepend">https://{{ domainName }}/p/</template>
                </el-input>
            </div>

            <div class="pvl" v-show="product.seo_page_title">
                <div class="fs11 colorGray mbs">Preview:</div>
                <seo-preview
                    :title="product.seo_page_title"
                    :description="product.seo_page_desc"
                    :uri="product.seo_uri" />
            </div>
        </text-card>


        <!-- Shipping -->
        <!-- <text-card>
            <div class="textCardHeader">Shipping</div>
            <div class="textCardContent">

                <div class="inputGroup mrl mbm">
                    <el-checkbox v-model="product.is_good">This is a physical product</el-checkbox>
                </div>

                <text-card-section >
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
        <text-card>
            <div slot="header">{{ $t('Metadata') }}</div>

            <div class="inputGroup mrl mbm">
                <el-checkbox v-model="productHasMetaData">{{ $t('Metadata_description') }}</el-checkbox>
            </div>

            <div v-if="productHasMetaData">
                <meta-data-builder v-model="product.metadata" />
            </div>
        </text-card>


        <!-- Pricing -->
        <!-- <text-card>
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
        <!-- <text-card>
            <div class="textCardHeader">Inventory</div>
            <div class="textCardContent">
                <div class="inputGroupContainer">

                </div>
            </div>
        </text-card> -->

        <div class="mtl">
            <el-button type="primary" @click="onSaveClick">{{ $t('Save') }}</el-button>
        </div>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_table.scss";
    @import "~assets/css/components/_formRow.scss";

    .textCard {
        margin-bottom: 30px;
    }

    .prodPic {
        width: 400px;
    }

    .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    .avatar-uploader .el-upload:hover {
        border-color: #409EFF;
    }
    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;
    }
    .avatar {
        width: 178px;
        height: 178px;
        display: block;
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
