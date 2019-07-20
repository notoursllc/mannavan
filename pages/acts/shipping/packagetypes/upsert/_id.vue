<script>
import FormRow from '@/components/FormRow'
import shipping_mixin from '@/mixins/shipping_mixin'

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
        FormRow
    },

    mixins: [
        shipping_mixin
    ],

    data() {
        return {
            packageType: {},
        }
    },

    methods: {
        async getPackageType() {
            try {
                const packageType = await this.getPackageTypeById(this.$route.params.id);

                if(!packageType) {
                    throw new Error(this.$t('Package Type not found'));
                }

                return packageType;
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


        async submit(packageType) {
            try {
                const p = await this.upsertPackageType(packageType);

                if(!p) {
                    throw new Error(this.$t('Error updating package type'));
                }

                let title = packageType.id ? 'Package Type updated successfully' : 'Package Type added successfully';

                this.$notify({
                    type: 'success',
                    title,
                    message: p.title,
                    duration: 3000
                });

                this.goToPackageTypeList();
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
                this.packageType = await this.getPackageTypeById(this.$route.params.id);
            }

            if(!this.packageType) {
                throw new Error(this.$t('Package Type info not found'));
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
                <el-breadcrumb-item :to="{ name: 'acts-shipping-packagetypes-list' }">Package Types</el-breadcrumb-item>
                <el-breadcrumb-item>{{ packageType.label }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <div class="paxl">

            <div class="displayTable">
                <div class="g-spec">
                    <div class="g-spec-label">General Info</div>
                    <div class="g-spec-content">
                        <!-- type ID -->
                        <form-row>
                            <template slot="label">Type ID:</template>
                            <template slot="value">
                                <el-input v-model="packageType.type" />
                            </template>
                        </form-row>

                        <!-- label -->
                        <form-row>
                            <template slot="label">Label:</template>
                            <template slot="value">
                                <el-input v-model="packageType.label" />
                            </template>
                        </form-row>
                    </div>
                </div>

                <div class="g-spec">
                    <div class="g-spec-label">Package dimensions</div>
                    <div class="g-spec-content">

                        <!-- length -->
                        <form-row>
                            <template slot="label">Length:</template>
                            <template slot="value">
                                <el-input-number
                                    v-model="packageType.length"
                                    :precision="2"
                                    :step="0.01"
                                    :min="0.01" />
                            </template>
                        </form-row>

                        <!-- width -->
                        <form-row>
                            <template slot="label">Width:</template>
                            <template slot="value">
                                <el-input-number
                                    v-model="packageType.width"
                                    :precision="2"
                                    :step="0.01"
                                    :min="0.01" />
                            </template>
                        </form-row>

                        <!-- height -->
                        <form-row>
                            <template slot="label">Height:</template>
                            <template slot="value">
                                <el-input-number
                                    v-model="packageType.height"
                                    :precision="2"
                                    :step="0.01"
                                    :min="0.01" />
                            </template>
                        </form-row>

                        <!-- distance unit -->
                        <form-row>
                            <template slot="label">Distance Unit:</template>
                            <template slot="value">
                                <el-select v-model="packageType.distance_unit">
                                    <el-option
                                        v-for="val in getShippingParcelDistanceUnits()"
                                        :key="val"
                                        :label="val"
                                        :value="val">
                                    </el-option>
                                </el-select>
                            </template>
                        </form-row>
                    </div>
                </div>

                <div class="g-spec">
                    <div class="g-spec-label">Package weight</div>
                    <div class="g-spec-content">
                        <!-- weight - note the back end requires this to be ounces -->
                        <form-row>
                            <template slot="label">Weight (oz):</template>
                            <template slot="value">
                                <el-input-number
                                    v-model="packageType.weight"
                                    :precision="2"
                                    :step="0.01" />
                            </template>
                        </form-row>
                    </div>
                </div>

                <div class="g-spec">
                    <div class="g-spec-label"></div>
                    <div class="g-spec-content">
                        <form-row>
                            <template slot="value">
                                <div class="ptl">
                                    <el-button
                                        type="primary"
                                        @click="submit(packageType)">SUBMIT</el-button>

                                    <el-button @click="goToPackageTypeList">CANCEL</el-button>
                                </div>
                            </template>
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
