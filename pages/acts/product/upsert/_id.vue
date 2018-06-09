<script>
import Vue from 'vue'
import { Notification, MessageBox, Dialog, Button, Input, InputNumber, Checkbox, Select, Option } from 'element-ui'
import VueYouTubeEmbed from 'vue-youtube-embed'
import forEach from 'lodash.foreach'
import FormRow from '@/components/FormRow'
import ProductSizeAdmin from '@/components/product/admin/ProductSizeAdmin'
import ProductPicturesAdmin from '@/components/product/admin/ProductPicturesAdmin'
import BitwiseMultiSelect from '@/components/BitwiseMultiSelect'
import product_mixin from '@/mixins/product_mixin'

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
        BitwiseMultiSelect
    },

    mixins: [
        product_mixin
    ],

    data() {
        return {
            product: {
                sizes: []
            },
            productInfo: {},
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

        productSizes() {
            return this.product.sizes;
        }
    },

    methods: {
        getProduct() {
            return this.getProductById(this.$route.params.id, { viewAllRelated: true })
                .then((product) => {
                    if(!product) {
                        throw new Error(this.$t('Product not found'));
                    }

                    return product;
                })
                .catch((e) => {
                    showNotification(
                        this.$notify({
                            type: 'error',
                            title: e.message,
                            duration: 0
                        })
                    );
                    // bugsnagClient.notify(e);
                });
        },

        goToStore(seoUri) {
            let routeData = this.$router.resolve({
                name: 'item-id',
                params: { id: seoUri }
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

        upsertProduct(product) {
            this.upsert(product)
                .then((p) => {
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
                })
                .catch((e) => {
                    showNotification(
                        this.$notify({
                            type: 'error',
                            title: e.message,
                            duration: 0
                        })
                    );
                    // bugsnagClient.notify(e);
                });
        }
    },

    created() {
        if(this.$route.params.id) {
            this.getProduct().then((product) => {
                this.product = product;
            });
        }

        this.getProductInfo()
            .then((productInfo) => {
                if(!productInfo) {
                    throw new Error(this.$t('Product info not found'));
                }

                this.productInfo = productInfo;
            })
            .catch((e) => {
                showNotification(
                    this.$notify({
                        type: 'error',
                        title: e.message,
                        duration: 0
                    })
                );
                // bugsnagClient.notify(e);
            });
    }
}
</script>


<template>
    <div class="pal">
        <div class="tar mbm">
            <el-button @click="goToStore(product.seo_uri)">
                <i class="notours icon-new-window"></i>&nbsp;&nbsp;VIEW PRODUCT IN STORE
            </el-button>
        </div>

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
                        <el-input-number v-model="product.weight_oz" controls-position="right" :step=".01"></el-input-number>
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
                sizes: {{ product.sizes }}
                <product-size-admin :product="product"></product-size-admin>
            </div>
        </div>

        <div class="g-spec">
            <div class="g-spec-label">Media</div>
            <div class="g-spec-content">
                <!-- video_url -->
                <div>
                    <div class="fwb fs14">Video URL:</div>
                    <el-input v-model="product.video_url">
                        <el-button
                            slot="append"
                            v-if="product.video_url"
                            @click="playVideo(product.video_url)"><i class="notours icon-play"></i></el-button>
                    </el-input>
                </div>

                <!-- pictures -->
                <div class="mtl">
                    <div class="fwb fs14">Pictures:</div>
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
                            :options="typeSelectOptions"
                            :init="product.type"
                            @changed="val => product.type = val"></bitwise-multi-select>
                    </form-row>

                    <!-- sub_type -->
                    <form-row label="Product sub-type:">
                        <bitwise-multi-select
                            :options="subTypeSelectOptions"
                            :init="product.sub_type"
                            @changed="val => product.sub_type = val"></bitwise-multi-select>
                    </form-row>

                    <!-- gender -->
                    <form-row label="Gender type:">
                        <bitwise-multi-select
                            :options="genderSelectOptions"
                            :init="product.gender"
                            @changed="val => product.gender = val"></bitwise-multi-select>
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


        <!-- <el-dialog title="Product video"
                :visible.sync="videoPlayerModal.isActive"
                :modal-append-to-body="false"
                @close="modalClosed">
            <youtube
                :video-id="videoPlayerModal.videoId"
                :player-vars="{ autoplay: 1 }"
                @playing="videoPlaying"></youtube>
        </el-dialog> -->
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
