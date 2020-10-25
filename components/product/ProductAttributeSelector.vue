<script>
import FigButton from '@notoursllc/figleaf/components/button/FigButton.vue';
import FigSelect from '@notoursllc/figleaf/components/select/FigSelect.vue';


export default {
    name: 'ProductAttributeSelector',

    props: {
        attribute: {
            type: Object,
            required: true
        },

        skus: {
            type: Array,
            default: () => {
                return [];
            }
        },

        value: {
            type: String,
            default: null,
            required: false
        }
    },

    data: function() {
        return {
            selectedValue: null
        };
    },

    computed: {
        optionLabelValues() {
            const opts = [];

            this.skus.forEach((sku) => {
                if(Array.isArray(sku.attributes)) {
                    sku.attributes.forEach((attr) => {
                        if(attr.value && attr.optionId === this.attribute.id) {
                            opts.push({
                                label: attr.label,
                                value: attr.value
                            });
                        }
                    });
                }
            });

            return opts;
        }
    },

    methods: {
        emitInput(value) {
            this.$emit('input', value);
        }
    },

    render: function(createElement) {
        const createdElements = [];
        const self = this;

        if(this.attribute.inputType === 'buttons') {
            const buttons = [];

            this.optionLabelValues.forEach((obj) => {
                buttons.push(
                    createElement(
                        FigButton,
                        {
                            props: {
                                variant: this.value === obj.value ? 'primary' : 'plain-outline'
                            },
                            class: 'attr-btn',
                            nativeOn: {
                                click: function() {
                                    self.emitInput(obj.value);
                                }
                            }
                        },
                        obj.label
                    )
                );
            });

            createdElements.push(buttons);
        }
        // select menu:
        else {
            createdElements.push(
                createElement(
                    FigSelect,
                    {
                        attrs: {
                            'v-model': this.value,
                            options: this.optionLabelValues
                        },
                        on: {
                            input: this.emitInput
                        }
                    }
                )
            );
        }

        return createElement(
            'span',
            {},
            createdElements
        );
    }
};
</script>

<!--
<template>
    <fig-select :options="[{label: 'Canada', value: 'ca'}]" />
</template>
-->

<style lang="scss" scoped>
@import "~assets/css/components/_mixins.scss";

.attr-btn-container {
    @include flexbox();
    @include flex-direction(row);
    @include justify-content(flex-start);
    @include align-items(flex-start);
    @include flex-wrap(wrap);
}

.attr-btn {
    margin: 0 7px 7px 0;
    min-width: 60px;
}
.attr-btn:last-child {
    margin-right: 0;
}
</style>
