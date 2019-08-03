<script>
import product_mixin from '@/mixins/product_mixin'

export default {
    middleware: 'authenticated',

    layout: 'admin',

    components: {
        FormRow: () => import('@/components/FormRow'),
        CountrySelect: () => import('@/components/CountrySelect'),
        SelectStateProvince: () => import('@/components/SelectStateProvince'),
        Fab: () => import('@/components/Fab')
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
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },


        async submit() {
            try {
                const p = await this.upsertProductArtist(this.artist);

                if(!p) {
                    throw new Error('Error updating product artist');
                }

                let title = this.artist.id ? 'Product artist updated successfully' : 'Product artist added successfully';

                this.$successMessage(
                    `${title}: ${p.title}`
                )

                this.goToProductArtistList();
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
                this.artist = await this.getProductArtistById(this.$route.params.id);
            }

            if(!this.artist) {
                throw new Error(this.$t('Product artist not found'));
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
        <fab type="save" @click="submit" />
        <fab type="cancel" @click="goToProductArtistList" />

        <div class="pbl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ name: 'acts-product-artist-list' }">Product Artists</el-breadcrumb-item>
                <el-breadcrumb-item>{{ artist.name }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <div class="displayTable widthAll">
            <div class="g-spec">
                <div class="g-spec-label">Personal</div>
                <div class="g-spec-content">
                    <!-- name -->
                    <form-row>
                        <template slot="label">Name:</template>
                        <template slot="value">
                            <el-input v-model="artist.name" />
                        </template>
                    </form-row>

                    <!-- email -->
                    <form-row>
                        <template slot="label">Email:</template>
                        <template slot="value">
                            <el-input v-model="artist.email" />
                        </template>
                    </form-row>

                    <!-- short description -->
                    <form-row>
                        <template slot="label">Short description:</template>
                        <template slot="value">
                            <el-input
                                v-model="artist.description_short"
                                type="textarea" />
                        </template>
                    </form-row>

                    <!-- long description -->
                        <form-row>
                        <template slot="label">Long description:</template>
                        <template slot="value">
                            <el-input
                                v-model="artist.description_long"
                                type="textarea"
                                :rows="2" />
                        </template>
                    </form-row>
                </div>
            </div>

            <div class="g-spec">
                <div class="g-spec-label">Address</div>
                <div class="g-spec-content">
                    <!-- city -->
                    <form-row>
                        <template slot="label">City:</template>
                        <template slot="value">
                            <el-input v-model="artist.city" />
                        </template>
                    </form-row>

                    <!-- state / province -->
                    <form-row>
                        <template slot="label">State / Province:</template>
                        <template slot="value">
                            <select-state-province
                                v-model.trim="artist.prov_state"
                                :country="artist.country" />
                        </template>
                    </form-row>

                    <!-- country -->
                    <form-row>
                        <template slot="label">Country:</template>
                        <template slot="value">
                            <country-select
                                :init-value="artist.country"
                                @change="(val) => { artist.country = val }" />
                        </template>
                    </form-row>
                </div>
            </div>

            <div class="g-spec" v-if="$route.params.id">
                <div class="g-spec-label">General</div>
                <div class="g-spec-content">
                    <!-- created -->
                    <form-row>
                        <template slot="label">Created:</template>
                        <template slot="value">
                            {{ artist.created_at | format8601 }}
                        </template>
                    </form-row>

                    <!-- updated -->
                    <form-row>
                        <template slot="label">Updated:</template>
                        <template slot="value">
                            {{ artist.updated_at | format8601 }}
                        </template>
                    </form-row>
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
