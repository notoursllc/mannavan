<script>
import forEach from 'lodash.foreach';
import isObject from 'lodash.isobject';
import product_mixin from '@/mixins/product_mixin';
import shipping_mixin from '@/mixins/shipping_mixin';
import uuid from 'uuid/v4';


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
        ImageManager: () => import('@/components/product/admin/ImageManager')
    },

    mixins: [
        product_mixin,
        shipping_mixin
    ],

    data() {
        return {
            product: {},
            productHasOptions: false,
            productHasMetaData: false,
            domainName: process.env.DOMAIN_NAME,
            imageManagerValue: [],
            imageManagerMaxImages: process.env.IMAGE_MANAGER_MAX_IMAGES || 8,
            videoPlayerModal: {
                isActive: false,
                videoId: null,
                player: null,
            }
        }
    },

    methods: {
        async fetchProduct(id) {
            try {
                const product = await this.$api.products.get(id, { viewAllRelated: true });

                if(!product) {
                    throw new Error(this.$t('Product not found'));
                }

                this.productHasOptions = product.attributes ? true : false;
                this.productHasMetaData = product.metadata ? true : false;
                this.product = product;

                if(isObject(this.product.images) && Array.isArray(this.product.images.data)) {
                    this.product.images.data.forEach((arr) => {
                        this.imageManagerValue.push(arr[0]);
                    })
                }
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },


        /**
         * Removes objects from product.images that are no longer used,
         * and also deletes the images from storage
         *
         * @returns Promise
         */
        deleteImages() {
            if(Array.isArray(this.imageManagerValue) && isObject(this.product.images)) {
                let newImageUrls = this.imageManagerValue.map(obj => obj.url);
                let toDelete = [];

                let i = Array.isArray(this.product.images.data) ? this.product.images.data.length : 0;
                while (i--) {
                    let hasUrl = false;
                    let arr = this.product.images.data[i];

                    arr.forEach((obj) => {
                        if(newImageUrls.indexOf(obj.url) > -1) {
                            hasUrl = true;
                        }
                    });

                    if(!hasUrl) {
                        // spread the array members (objects) into toDelete
                        // instead of the array itself:
                        toDelete.push(...arr);
                        this.product.images.data.splice(i, 1);
                    }
                }

                const imageDeletePromises = [];
                toDelete.forEach((obj) => {
                    imageDeletePromises.push(
                        this.$api.storage.deleteImage(obj.url)
                    )
                });

                return Promise.all(imageDeletePromises);
            }
        },


        async upsertImages() {
            if(Array.isArray(this.imageManagerValue)) {
                const newImages = this.imageManagerValue.filter((obj) => { return obj.hasOwnProperty('raw') });

                // upload the new images:
                const newImagePromises = [];
                newImages.forEach((obj) => {
                    let formData = new FormData();
                    formData.append('file', obj.raw)
                    newImagePromises.push(
                        this.$api.storage.addImage(formData)
                    );
                });

                const imageUploadResult = await Promise.all(newImagePromises);

                // adding the alt text to each upload result
                newImages.forEach((obj, index) => {
                    imageUploadResult[index].forEach((imgObject) => {
                        imgObject.altText = obj.altText;
                    });
                })

                // imageUploadResult only contains the new images that were added (not the pre-existing ones)
                // so if there are pre-existing images, we just concat the new ones to the list
                // otherwise we set the images data to the imageUploadResult
                if(isObject(this.product.images)) {
                    this.product.images.data = this.product.images.data.concat(imageUploadResult)
                }
                else {
                    this.product.images = {
                        data: imageUploadResult
                    }
                }
            }
        },


        async upsert() {
            // Delete the unused images
            try {
                await this.deleteImages();
            }
            catch(e) {
                this.$bugsnag.notify(err);
            }

            try {
                if(!this.productHasOptions) {
                    this.product.attributes = null;
                }

                if(!this.productHasMetaData) {
                    this.product.metadata = null;
                }

                await this.upsertImages();

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

    mounted() {
        try {
            if(this.$route.params.id) {
                this.fetchProduct(this.$route.params.id);
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


        <text-card class="mbl">
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
        <text-card class="mbl">
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
        <text-card class="mbl">
            <div slot="header">
                {{ $t('Images') }}
                <span class="fs11 plm">{{ $t('You can add up to num images', {number: imageManagerMaxImages}) }}</span>
            </div>
            <image-manager
                v-model="imageManagerValue"
                :max-num-images="parseInt(imageManagerMaxImages, 10)" />
        </text-card>


        <!-- Options -->
        <text-card class="mbl">
            <div slot="header">{{ $t('Options') }}</div>

            <div class="inputGroup mrl mbm">
                <el-checkbox v-model="productHasOptions">This product has multiple options, like different sizes or colors</el-checkbox>
            </div>

            <div v-if="productHasOptions">
                <attribute-builder v-model="product.attributes" />
            </div>
        </text-card>


        <!-- SEO -->
        <text-card class="mbl">
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
        <text-card class="mbl">
            <div slot="header">{{ $t('Metadata') }}</div>

            <div class="inputGroup mrl mbm">
                <el-checkbox v-model="productHasMetaData">{{ $t('Metadata_description') }}</el-checkbox>
            </div>

            <div v-if="productHasMetaData">
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

        <div class="mtl">
            <el-button type="primary" @click="upsert">{{ $t('Save') }}</el-button>
        </div>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_table.scss";
    @import "~assets/css/components/_formRow.scss";

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
