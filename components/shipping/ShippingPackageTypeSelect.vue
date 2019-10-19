<script>
import shipping_mixin from '@/mixins/shipping_mixin';

export default {
    name: 'ShippingPackageTypeSelect',

    props: {
        value: {
            type: String
        }
    },

    mixins: [
        shipping_mixin
    ],

    data: function() {
        return {
            types: [],
            selectedVal: null
        }
    },

    computed: {
        selectedType() {
            let t = null;

            if(this.selectedVal) {
                this.types.forEach((type) => {
                    if(type.id === this.selectedVal) {
                        t = type;
                    }
                });
            }

            return t;
        }
    },

    methods: {
        emitChange(val) {
            this.$emit('input', val)
        },

        async fetchPackageTypes() {
            this.types = await this.shipmix_getPackageTypes({
                orderBy: 'name',
                orderDir: 'ASC'
            });
        }
    },

    created() {
        this.fetchPackageTypes();
    },

    watch: {
        value: {
            handler(newVal) {
                this.selectedVal = newVal;
            },
            immediate: true,
        }
    }
}
</script>


<template>
    <div>
        <el-select
            v-model="selectedVal"
            @change="emitChange"
            @clear="() => { selectedVal = null }"
            class="widthAll"
            :no-match-text="$t('No matching values')"
            :clearable="true">
            <el-option
                v-for="item in types"
                :key="item.id"
                :label="item.label"
                :value="item.id">
            </el-option>
        </el-select>
        <div v-if="selectedType" class="fs12 colorGray">
            <span class="prs">Length ({{ selectedType.distance_unit }}.): {{ selectedType.length }},</span>
            <span class="prs">Width ({{ selectedType.distance_unit }}.): {{ selectedType.width }},</span>
            <span class="prs">Height ({{ selectedType.distance_unit }}.): {{ selectedType.height }}</span>
        </div>
    </div>
</template>
