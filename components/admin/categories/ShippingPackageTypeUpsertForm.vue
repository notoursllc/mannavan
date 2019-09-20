<script>
import shipping_mixin from '@/mixins/shipping_mixin'

export default {
    name: 'ShippingPackageTypeUpsertForm',

    props: {
        id: {
            type: String,
            required: false
        },
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
                const packageType = await this.getPackageTypeById(this.id);

                if(!packageType) {
                    throw new Error(this.$t('Package Type not found'));
                }

                return packageType;
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
                const p = await this.upsertPackageType(this.packageType);

                if(!p) {
                    throw new Error(this.$t('Error updating package type'));
                }

                let title = this.packageType.id ? 'Package Type updated successfully' : 'Package Type added successfully';
                this.$successMessage(`${title}: ${p.label}`)
                this.$emit('success')
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        onCancel() {
            this.$emit('cancel')
        }
    },

     watch: {
        id: {
            handler: async function(newVal) {
                try {
                    if(newVal) {
                        this.packageType = await this.getPackageTypeById(this.id);

                        if(!this.packageType) {
                            throw new Error(this.$t('Package Type info not found'));
                        }
                    }
                }
                catch(e) {
                    this.$errorMessage(
                        e.message,
                        { closeOthers: true }
                    )
                }
            },
            immediate: true,
        }
    }
}
</script>


<template>
    <div class="displayTable widthAll">
        <div class="g-spec">
            <div class="g-spec-label">General Info</div>
            <div class="g-spec-content">
                <!-- type ID -->
                <div class="formRow">
                    <label>Type ID:</label>
                    <span>
                        <el-input v-model="packageType.type" />
                    </span>
                </div>

                <!-- label -->
                <div class="formRow">
                    <label>Label:</label>
                    <span>
                        <el-input v-model="packageType.label" />
                    </span>
                </div>
            </div>
        </div>

        <div class="g-spec">
            <div class="g-spec-label">Package dimensions</div>
            <div class="g-spec-content">

                <!-- length -->
                <div class="formRow">
                    <label>Length:</label>
                    <span>
                        <el-input-number
                            v-model="packageType.length"
                            :precision="2"
                            :step="0.01"
                            :min="0.01" />
                    </span>
                </div>

                <!-- width -->
                <div class="formRow">
                    <label>Width:</label>
                    <span>
                        <el-input-number
                            v-model="packageType.width"
                            :precision="2"
                            :step="0.01"
                            :min="0.01" />
                    </span>
                </div>

                <!-- height -->
                <div class="formRow">
                    <label>Height:</label>
                    <span>
                        <el-input-number
                            v-model="packageType.height"
                            :precision="2"
                            :step="0.01"
                            :min="0.01" />
                    </span>
                </div>

                <!-- distance unit -->
                <div class="formRow">
                    <label>Distance Unit:</label>
                    <span>
                        <el-select
                            v-model="packageType.distance_unit"
                            :clearable="true"
                            @clear="() => { packageType.distance_unit = null }">
                            <el-option
                                v-for="val in getShippingParcelDistanceUnits()"
                                :key="val"
                                :label="val"
                                :value="val">
                            </el-option>
                        </el-select>
                    </span>
                </div>
            </div>
        </div>

        <div class="g-spec">
            <div class="g-spec-label">Package weight</div>
            <div class="g-spec-content">
                <!-- weight - note the back end requires this to be ounces -->
                <div class="formRow">
                    <label>Weight (oz):</label>
                    <span>
                        <el-input-number
                            v-model="packageType.weight"
                            :precision="2"
                            :step="0.01" />
                    </span>
                </div>
            </div>
        </div>

        <div class="g-spec">
            <div class="g-spec-label"></div>
            <div class="g-spec-content">
                <el-button
                    type="primary"
                    @click="submit">Save</el-button>

                <el-button
                    @click="onCancel">Cancel</el-button>
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
