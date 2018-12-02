<script>
import Vue from 'vue'
import { Notification, Button, Input, InputNumber, Select, Option, Breadcrumb, BreadcrumbItem } from 'element-ui'
import FormRow from '@/components/FormRow'
import CountrySelect from '@/components/CountrySelect'
import product_mixin from '@/mixins/product_mixin'

Vue.prototype.$notify = Notification;

Vue.use(Button);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(Select);
Vue.use(Option);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem);

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
        CountrySelect
    },

    mixins: [
        product_mixin
    ],

    data() {
        return {
            artist: {},
        }
    },

    methods: {
        async getArtist() {
            try {
                const artist = await this.getProductArtistById(this.$route.params.id);

                if(!artist) {
                    throw new Error('Product artist not found');
                }

                return artist;
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


        async submit(artist) {
            try {
                const p = await this.upsertProductArtist(artist);

                if(!p) {
                    throw new Error('Error updating product artist');
                }

                let title = artist.id ? 'Product artist updated successfully' : 'Product artist added successfully';

                this.$notify({
                    type: 'success',
                    title,
                    message: p.title,
                    duration: 3000
                });

                this.goToProductArtistList();
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
                this.artist = await this.getProductArtistById(this.$route.params.id);
            }

            if(!this.artist) {
                throw new Error(this.$t('Product artist not found'));
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
    <div>
        <div class="pal">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ name: 'acts-product-artist-list' }">Product Artists</el-breadcrumb-item>
                <el-breadcrumb-item>{{ artist.name }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <div class="paxl">

            <div class="displayTable">
                <div class="g-spec">
                    <div class="g-spec-label">General Info</div>
                    <div class="g-spec-content">

                        <!-- name -->
                        <form-row label="Name:">
                            <el-input v-model="artist.name"></el-input>
                        </form-row>

                        <!-- email -->
                        <form-row label="Email:">
                            <el-input v-model="artist.email"></el-input>
                        </form-row>

                        <!-- short description -->
                        <form-row label="Short description:">
                            <el-input
                                v-model="artist.description_short"
                                type="textarea"
                                :rows="2"></el-input>
                        </form-row>

                        <!-- long description -->
                        <form-row label="Long description:">
                            <el-input
                                v-model="artist.description_long"
                                type="textarea"
                                :rows="2"></el-input>
                        </form-row>

                    </div>
                </div>

                <div class="g-spec">
                    <div class="g-spec-label">Address</div>
                    <div class="g-spec-content">
                        <!-- city -->
                        <form-row label="City:">
                            <el-input v-model="artist.city"></el-input>
                        </form-row>

                        <!-- state / province -->
                        <form-row label="State / Province:">
                            <el-input v-model="artist.prov_state"></el-input>
                        </form-row>

                        <!-- country -->
                        <form-row label="Country:">
                            <country-select
                                :init-value="artist.country"
                                @change="(val) => { artist.country = val }" />
                        </form-row>
                    </div>
                </div>

                <div class="g-spec" v-if="$route.params.id">
                    <div class="g-spec-label"></div>
                    <div class="g-spec-content">
                        <!-- created -->
                        <form-row label="Created:">{{ artist.created_at | format8601 }}</form-row>

                        <!-- updated -->
                        <form-row label="Updated:">{{ artist.updated_at | format8601}}</form-row>
                    </div>
                </div>

                <div class="g-spec">
                    <div class="g-spec-label"></div>
                    <div class="g-spec-content">

                        <form-row label="">
                            <div class="ptl">
                                <el-button
                                    type="primary"
                                    @click="submit(artist)">SUBMIT</el-button>

                                <el-button @click="goToProductArtistList">CANCEL</el-button>
                            </div>
                        </form-row>

                    </div>
                </div>

            </div>

        </div>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_table.scss";

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
