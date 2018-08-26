<script>
import Vue from 'vue'
import { Notification, MessageBox, Dialog, Button, Input, InputNumber, Checkbox, Select, Option } from 'element-ui'
import VueYouTubeEmbed from 'vue-youtube-embed'
import forEach from 'lodash.foreach'
import FormRow from '@/components/FormRow'
import ProductSizeAdmin from '@/components/product/admin/ProductSizeAdmin'
import ProductPicturesAdmin from '@/components/product/admin/ProductPicturesAdmin'
import BitwiseMultiSelect from '@/components/BitwiseMultiSelect'
import IconNewWindow from '@/components/icons/IconNewWindow'
import IconPlayVideo from '@/components/icons/IconPlayVideo'
import product_mixin from '@/mixins/product_mixin'
import shipping_mixin from '@/mixins/shipping_mixin'

Vue.prototype.$notify = Notification;
Vue.prototype.$confirm = MessageBox.confirm;

Vue.use(Button);
Vue.use(Dialog);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(Checkbox);
Vue.use(Select);
Vue.use(Option);
Vue.use(VueYouTubeEmbed)

let currentNotification = null;


function showNotification(Notification) {
    if(currentNotification) {
        currentNotification.close();
    }
    currentNotification = Notification
}


export default {
    middleware: 'authenticated',

    layout: 'admin',

    components: {
        FormRow,
        ProductSizeAdmin,
        ProductPicturesAdmin,
        BitwiseMultiSelect,
        IconNewWindow,
        IconPlayVideo
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

        genderSelectOptions() {
            let opts = {};
            let self = this;
            forEach(this.productInfo.genders, function(val, key) {
                opts[self.$t(key)] = val;
            });
            return opts;
        },

        packageTypeSelectOptions() {
            let opts = {};
            let self = this;
            forEach(this.shippingPackageTypes, function(obj) {
                opts[obj.label] = obj.type;
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
                showNotification(
                    this.$notify({
                        type: 'error',
                        title: e.message,
                        duration: 0
                    })
                );
            }
        },

        goToStore(seoUri) {
            let productTypeName;
            let label;

            forEach(this.productInfo.subTypes, (val, key) => {
                if(val & this.product.type) {
                    productTypeName = key;
                }
            });

            if(productTypeName) {
                label = this.getProductSubTypeData(productTypeName).label;
            }

            let routeData = this.$router.resolve({
                name: 'type-name-seouri',
                params: { name: label || 'tops', seouri: seoUri }
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

        async upsertProduct(product) {
            try {
                const p = await this.upsert(product);

                if(!p) {
                    throw new Error(this.$t('Error updating product'));
                }

                let title = 'Product added successfully';
                if(product.id) {
                    title = 'Product updated successfully';
                }

                this.$notify({
                    type: 'success',
                    title,
                    message: p.title,
                    duration: 3000
                });

                this.goToAdminProductList();
            }
            catch(e) {
                showNotification(
                    this.$notify({
                        type: 'error',
                        title: e.message,
                        duration: 0
                    })
                );
            }
        }
    },

    async created() {
        try {
            if(this.$route.params.id) {
                this.product = await this.getProduct();
            }

            this.productInfo = await this.getProductInfo();
            this.shippingPackageTypes = await this.getPackageTypes();

            if(!this.productInfo) {
                throw new Error(this.$t('Product info not found'));
            }
        }
        catch(e) {
            showNotification(
                this.$notify({
                    type: 'error',
                    title: e.message,
                    duration: 0
                })
            );
        }
    }
}
</script>


<template>
    <div class="pal">
        <div class="tar mbm">
            <el-button @click="goToStore(product.seo_uri)">
                <icon-new-window icon-name="new_window" width="15px" />
                &nbsp;&nbsp;VIEW PRODUCT IN STORE
            </el-button>
        </div>

        <div class="displayTable widthAll">
            <div class="g-spec">
                <div class="g-spec-label">General Info</div>
                <div class="g-spec-content">
                    <div class="formContainer">

                        <!-- is_available -->
                        <form-row label="Available:">
                            <el-checkbox v-model="product.is_available"></el-checkbox>
                        </form-row>

                        <!-- title -->
                        <form-row label="Title:">
                            <el-input v-model="product.title"></el-input>
                        </form-row>

                        <!-- description_short -->
                        <form-row label="Short Description:">
                            <el-input type="textarea" :rows="2" v-model="product.description_short"></el-input>
                        </form-row>

                        <!-- description_long -->
                        <form-row label="Long Description:">
                            <el-input type="textarea" :rows="3" v-model="product.description_long"></el-input>
                        </form-row>

                        <!-- seo_uri -->
                        <form-row label="SEO URI:">
                            <el-input v-model="product.seo_uri"></el-input>
                        </form-row>

                        <!-- weight_oz -->
                        <form-row label="Weight (oz):">
                            <el-input-number v-model="product.weight_oz" controls-position="right" :step=".1"></el-input-number>
                        </form-row>

                        <!-- tax_code -->
                        <form-row label="Tax code:">
                            <el-input-number v-model="product.tax_code" controls-position="right" :step="1"></el-input-number>
                        </form-row>

                        <!-- sku -->
                        <form-row label="SKU:">
                            <el-input v-model="product.sku"></el-input>
                        </form-row>

                    </div>
                </div>
            </div>

            <div class="g-spec">
                <div class="g-spec-label">Pricing</div>
                <div class="g-spec-content">
                    <div class="formContainer">

                        <!-- cost -->
                        <form-row label="Cost:">
                            <el-input-number v-model="product.cost" controls-position="right" :step=".01"></el-input-number>
                        </form-row>

                        <!-- base_price -->
                        <form-row label="Base price:">
                            <el-input-number v-model="product.base_price" controls-position="right" :step=".01"></el-input-number>
                        </form-row>

                        <!-- sale_price -->
                        <form-row label="Sale price:">
                            <el-input-number v-model="product.sale_price" controls-position="right" :step=".01"></el-input-number>
                        </form-row>

                        <!-- sale_price -->
                        <form-row label="On sale:">
                            <el-checkbox v-model="product.is_on_sale"></el-checkbox>
                        </form-row>

                    </div>
                </div>
            </div>

            <div class="g-spec">
                <div class="g-spec-label">Sizes</div>
                <div class="g-spec-content">
                    <product-size-admin :product-id="product.id"></product-size-admin>
                </div>
            </div>

            <div class="g-spec">
                <div class="g-spec-label">Media</div>
                <div class="g-spec-content">
                    <!-- video_url -->
                    <form-row label="Video URL:">
                        <el-input v-model="product.video_url" style="width:600px">
                            <el-button
                                slot="append"
                                v-if="product.video_url"
                                @click="playVideo(product.video_url)">
                                <icon-play-video icon-name="play" width="20px" />
                            </el-button>
                        </el-input>
                    </form-row>

                    <!-- pictures -->
                    <div class="mtl">
                        <product-pictures-admin :product-id="product.id"></product-pictures-admin>
                    </div>
                </div>
            </div>

            <div class="g-spec">
                <div class="g-spec-label">Inventory</div>
                <div class="g-spec-content">
                    <div class="formContainer">

                        <!-- inventory_count -->
                        <form-row label="Inventory count:">
                            <el-input-number v-model="product.inventory_count" controls-position="right" :step="1"></el-input-number>
                        </form-row>

                        <!-- hide_if_out_of_stock -->
                        <form-row label="Hide if out of stock:">
                            <el-checkbox v-model="product.hide_if_out_of_stock"></el-checkbox>
                        </form-row>

                    </div>
                </div>
            </div>

            <div class="g-spec">
                <div class="g-spec-label">Categories</div>
                <div class="g-spec-content">
                    <div class="formContainer">

                        <!-- type -->
                        <form-row label="Product type:">
                            <bitwise-multi-select
                                v-model="product.type"
                                :options="typeSelectOptions"></bitwise-multi-select>
                        </form-row>

                        <!-- sub_type -->
                        <form-row label="Product sub-type:">
                            <bitwise-multi-select
                                v-model="product.sub_type"
                                :options="subTypeSelectOptions"></bitwise-multi-select>
                        </form-row>

                        <!-- gender -->
                        <form-row label="Gender type:">
                            <bitwise-multi-select
                                v-model="product.gender"
                                :options="genderSelectOptions"></bitwise-multi-select>
                        </form-row>

                    </div>
                </div>
            </div>

            <!-- Shipping -->
            <div class="g-spec">
                <div class="g-spec-label">Shipping</div>
                <div class="g-spec-content">
                    <div class="formContainer">

                        <!-- package type -->
                        <form-row label="Shipping package type:">
                            <!-- <bitwise-multi-select
                                v-model="product.shipping_package_type"
                                :options="packageTypeSelectOptions"></bitwise-multi-select> -->
                            <el-select v-model="product.shipping_package_type">
                                <el-option
                                    v-for="(val, key) in packageTypeSelectOptions"
                                    :key="val"
                                    :label="key"
                                    :value="val">
                                </el-option>
                            </el-select>
                        </form-row>

                    </div>
                </div>
            </div>


            <div class="g-spec">
                <div class="g-spec-label"></div>
                <div class="g-spec-content">
                    <el-button
                        type="primary"
                        @click="upsertProduct(product)">SUBMIT</el-button>

                    <el-button @click="goToAdminProductList">CANCEL</el-button>
                </div>
            </div>
        </div>


        <el-dialog title="Product video"
                :visible.sync="videoPlayerModal.isActive"
                @close="modalClosed"
                width="90%"
                top="5vh">
            <youtube
                :video-id="videoPlayerModal.videoId"
                :player-vars="{ autoplay: 1 }"
                player-width="100%"
                @playing="videoPlaying"></youtube>
        </el-dialog>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_table.scss";

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
