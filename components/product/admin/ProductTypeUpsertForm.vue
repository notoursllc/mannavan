<script>
export default {
    name: 'ProductTypeUpsertForm',

    props: {
        type: {
            type: Object,
            required: false,
            default: {}
        },
    },

    methods: {
        onCancel() {
            this.$emit('cancel')
        },

        onSave() {
            this.$emit('save', this.type)
        }
    }
}
</script>


<template>
    <div class="displayTable widthAll">

        <!-- Available -->
        <div class="formRow">
            <label class="width100">Available:</label>
            <span>
                <el-checkbox v-model="type.is_available" />
            </span>
        </div>

        <!-- Name -->
        <div class="formRow">
            <label>Name:</label>
            <span>
                <el-input v-model="type.name" />
            </span>
        </div>

        <!-- Slug -->
        <div class="formRow">
            <label>Slug:</label>
            <span>
                <el-input v-model="type.slug" />
            </span>
        </div>

        <!-- Value -->
        <div class="formRow">
            <label>Value:</label>
            <span> {{ type.value }}</span>
        </div>

        <!-- buttons -->
        <div class="formRow">
            <label></label>
            <span class="ptl">
                <el-button
                    type="primary"
                    @click="onSave">Save</el-button>

                <el-button
                    @click="onCancel">Cancel</el-button>
            </span>
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
