<script>
import forEach from 'lodash.foreach';
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';
import product_mixin from '@/mixins/product_mixin';
import shipping_mixin from '@/mixins/shipping_mixin';


export default {
    middleware: 'authenticated',

    layout: 'admin',

    components: {
        ProductSizeAdmin: () => import('@/components/product/admin/ProductSizeAdmin'),
        MasterTypeSelect: () => import('@/components/admin/MasterTypeSelect'),
        VendorSelect: () => import('@/components/product/admin/VendorSelect'),
        // MaterialTypeSelect: () => import('@/components/product/admin/MaterialTypeSelect'),
        IconNewWindow: () => import('@/components/icons/IconNewWindow'),
        IconPlayVideo: () => import('@/components/icons/IconPlayVideo'),
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
        shipping_mixin
    ],

    data() {
        return {
            loading: false,
            loadingProductImages: false,
            product: {
                attributes: [],
                skus: [],
                images: []
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

                if(!Array.isArray(product.images)) {
                    product.images = [];
                }

                this.product = product;
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }

            this.loading = false;
        },


        async onDeleteProductImage(id) {
            try {
                this.loadingProductImages = true;
                await this.$api.products.deleteImage(id);
                this.$successMessage(this.$t('Image deleted successfully'));
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }

            this.loadingProductImages = false;
        },


        async upsertProductImages() {
                const newImages = this.product.images.filter((obj) => { return obj.hasOwnProperty('raw') });
                const newImagePromises = [];

                // upload the new images:
                newImages.forEach((obj) => {
                    let formData = new FormData();
                    formData.append('file', obj.raw);
                    formData.append('alt_text', obj.alt_text);
                    newImagePromises.push(
                        this.$api.products.uploadImage(formData)
                    );
                });

                return Promise.all(newImagePromises);
        },


        saveSkus(productId) {
            const promises = [];

            if(Array.isArray(this.product.skus)) {
                this.product.skus.forEach((obj) => {
                    const formData = new FormData();

                    Object.keys(obj).forEach((key) => {
                        switch(key) {
                            case 'images':
                                obj.images.forEach((imageObj) => {
                                    formData.append('image_id', imageObj.id || null);
                                    formData.append('images', imageObj.raw || null);
                                    formData.append('image_alt_text', imageObj.alt_text);
                                    formData.append('image_ordinal', imageObj.ordinal);
                                });
                                break;

                            case 'attributes':
                            case 'metadata':
                                formData.set(key, Array.isArray(obj[key]) ? JSON.stringify(obj[key]) : '');
                                break;

                            default:
                                formData.set(key, obj[key] || '');
                        }
                    });

                    formData.set('product_id', productId)

                    promises.push(
                        this.$api.products.upsertSku(formData)
                    );
                });
            }

            return Promise.all(promises);
        },


        async onSaveClick() {
            try {
                this.loading = true;

                const formData = new FormData();

                Object.keys(this.product).forEach((key) => {
                    switch(key) {
                        case 'images':
                            this.product.images.forEach((obj) => {
                                formData.append('image_id', obj.id || null);
                                formData.append('images', obj.raw || null);
                                formData.append('image_alt_text', obj.alt_text);
                                formData.append('image_ordinal', obj.ordinal);
                            });
                            break;

                        case 'attributes':
                        case 'metadata':
                            formData.set(key, Array.isArray(this.product[key]) ? JSON.stringify(this.product[key]) : '');
                            break;

                        case 'skus':
                            // skus should not be included
                            break;

                        default:
                            formData.set(key, this.product[key] || '');
                    }
                })

                const p = await this.$api.products.upsert(formData);

                if(!p) {
                    throw new Error('Error updating product');
                }

                // Saving the SKUs separately
                await this.saveSkus(p.id);

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

            this.loading = false;
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


        <!-- Organization -->
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
                v-loading="loadingProductImages"
                v-model="product.images"
                :max-num-images="parseInt(imageManagerMaxImages, 10)"
                @delete="onDeleteProductImage" />
        </text-card>


        <!-- Variants / Options -->
        <text-card>
            <div slot="header">{{ $t('Variants') }}</div>

            <template v-if="product.id">
                <sku-manager
                    :product="product" />
            </template>

            <template v-else>
                <div class="inputGroup mrl mbm">
                    <el-checkbox v-model="productHasOptions">{{ $t('product_variant_description') }} </el-checkbox>
                </div>

                <div v-if="productHasOptions">
                    <!-- <sku-builder
                        :product="product"
                        :max-count="3"
                        :suggestions="[
                            this.$t('Size'),
                            this.$t('Color'),
                            this.$t('Material')
                        ]" /> -->

                    <!-- test -->
                    <!-- <div class="sku-preview" v-show="product.attributes.length"> -->
                    <div class="sku-preview">
                        <sku-manager
                            :product="product"
                            :details-view="true"
                            :max-count="3"
                            :attribute-suggestions="[
                                this.$t('Size'),
                                this.$t('Color'),
                                this.$t('Material')
                            ]" />
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
