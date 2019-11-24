<script>
import VueTagsInput from '@johmun/vue-tags-input';

export default {
    name: 'TagsInput',

    components: {
        VueTagsInput
    },

    props: {
        value: {
            type: Array
        },

        size: {
            type: String,
            default: 'large'
        },

        placeholder: {
            type: String,
            default: ''
        }
    },

    data: function() {
        return {
            tags: [],
            currentTag: ''
        }
    },

    computed: {
        className() {
            return `el-input--${this.size}`;
        }
    },

    methods: {
        emitInput() {
            this.$emit('input', this.tags);
        },

        onInputChange(newTags) {
            if(Array.isArray(newTags)) {
                this.tags = newTags.map(obj => obj.text);
            }
            this.emitInput();
        }
    },

    watch: {
        value: {
            handler: function(newVal) {
                if(Array.isArray(newVal)) {
                    let tags = newVal.map((val) => {
                        return { 'text': val }
                    });
                    this.tags = tags;
                }
            },
            immediate: true,
        }
    }
}
</script>


<template>
    <vue-tags-input
        v-model="currentTag"
        :tags="tags"
        @tags-changed="onInputChange"
        :add-on-key="[13, ',']"
        class="el-input"
        :class="className"
        :placeholder="placeholder" />
</template>

<style lang="scss">
@import "~assets/css/components/_mixins.scss";

.vue-tags-input {
    .ti-input {
        border-radius: 4px !important;
        border: 1px solid #DCDFE6 !important;
        font-size: 13px !important;
        width: 100%;
        white-space: nowrap;
    }

    .ti-tag {
        background-color: #ecf5ff;
        border: 1px solid #d9ecff;
        color: #363636;
        box-sizing: border-box;

        .ti-actions {
            margin-left: 8px;

            .ti-icon-close {
                color: #868686;
            }
        }
    }

    .ti-deletion-mark {
        color: #fff;
        border: 1px solid #f9061c;

        .ti-actions {
            .ti-icon-close {
                color: #fff;
            }
        }
    }
}

.el-input--large {
    .ti-tag {
        height: 26px;
        padding: 4px 4px 4px 8px;
        line-height: 26px;
        font-size: 14px;

        .ti-actions {
            .ti-icon-close {
                font-size: 20px
            }
        }
    }

    .ti-new-tag-input-wrapper {
        font-size: 14px;
    }
}

</style>
