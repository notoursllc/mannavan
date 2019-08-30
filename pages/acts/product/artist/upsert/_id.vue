<script>
import product_mixin from '@/mixins/product_mixin'

export default {
    middleware: 'authenticated',

    layout: 'admin',

    components: {
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
                    <div class="formRow">
                        <label>Name:</label>
                        <span>
                            <el-input v-model="artist.name" />
                        </span>
                    </div>

                    <!-- email -->
                    <div class="formRow">
                        <label>Email:</label>
                        <span>
                            <el-input v-model="artist.email" />
                        </span>
                    </div>

                    <!-- short description -->
                    <div class="formRow">
                        <label>Short description:</label>
                        <span>
                            <el-input
                                v-model="artist.description_short"
                                type="textarea" />
                        </span>
                    </div>

                    <!-- long description -->
                    <div class="formRow">
                        <label>Long description:</label>
                        <span>
                            <el-input
                                v-model="artist.description_long"
                                type="textarea"
                                :rows="2" />
                        </span>
                    </div>
                </div>
            </div>

            <div class="g-spec">
                <div class="g-spec-label">Address</div>
                <div class="g-spec-content">
                    <!-- city -->
                    <div class="formRow">
                        <label>City:</label>
                        <span>
                            <el-input v-model="artist.city" />
                        </span>
                    </div>

                    <!-- state / province -->
                    <div class="formRow">
                        <label>State / Province:</label>
                        <span>
                            <select-state-province
                                v-model.trim="artist.prov_state"
                                :country="artist.country" />
                        </span>
                    </div>

                    <!-- country -->
                    <div class="formRow">
                        <label>Country:</label>
                        <span>
                            <country-select
                                :init-value="artist.country"
                                @change="(val) => { artist.country = val }" />
                        </span>
                    </div>
                </div>
            </div>

            <div class="g-spec" v-if="$route.params.id">
                <div class="g-spec-label">General</div>
                <div class="g-spec-content">
                    <!-- created -->
                    <div class="formRow">
                        <label>Created:</label>
                        <span>{{ artist.created_at | format8601 }}</span>
                    </div>

                    <!-- updated -->
                    <div class="formRow">
                        <label>Updated:</label>
                        <span>{{ artist.updated_at | format8601 }}</span>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>


<style lang="scss">
@import "~assets/css/components/_table.scss";
@import "~assets/css/components/_formRow.scss";

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
