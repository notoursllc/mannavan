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

    data: function() {
        return {
            form: {
                name: null,
                slug: null
            },
        }
    },

    computed: {
        slugSuggestion() {
            let name;

            if(this.form.name) {
                name = this.form.name;
                return name.replace(/ /g,"_").toLowerCase().replace(/[^a-z_0-9]/g, "");
            }

            return name;
        }
    },

    methods: {
        onCancel() {
            this.$emit('cancel')
        },

        onSave() {
            this.$emit('save', this.form)
        },

        onUseSlugSuggestion() {
            this.form.slug = this.slugSuggestion;
        }
    },

    watch: {
        'type': {
            handler(newVal) {
                this.form = Object.assign(this.form, newVal);
            },
            immediate: true
        },
    },
}
</script>


<template>
    <div class="displayTable widthAll">

        <!-- Available -->
        <div class="formRow">
            <label class="width100">Available:</label>
            <span>
                <el-checkbox v-model="form.is_available" />
            </span>
        </div>

        <!-- Name -->
        <div class="formRow">
            <label>Name:</label>
            <span>
                <el-input v-model="form.name" />
            </span>
        </div>

        <!-- Slug -->
        <div class="formRow">
            <label>Slug:</label>
            <span>
                <el-input v-model="form.slug" />
                <div class="fs12" v-show="slugSuggestion">
                    <span class="colorGrayLighter">Suggestion:</span>&nbsp;&nbsp;{{ slugSuggestion }}&nbsp;&nbsp;(<a @click="onUseSlugSuggestion">use this</a>)
                </div>
            </span>
        </div>

        <!-- Value -->
        <div class="formRow">
            <label>Value:</label>
            <span> {{ form.value }}</span>
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
