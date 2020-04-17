<script>
import { Select, Option, Button } from 'element-ui';

export default {
    name: 'ProductAttributeSelector',

    inheritAttrs: false,

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
                        Button,
                        {
                            props: {
                                type: this.value === obj.value ? 'primary' : 'plain'
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
            const selectOptions = [];

            this.optionLabelValues.forEach((obj) => {
                selectOptions.push(
                    createElement(Option, {
                        props: {
                            label: obj.label,
                            value: obj.value
                        }
                    })
                );
            });

            const select = createElement(
                Select,
                {
                    props: {
                        value: this.value
                    },
                    on: {
                        input: this.emitInput
                    }
                },
                selectOptions
            );

            createdElements.push(select);
        }

        return createElement(
            'span',
            {},
            createdElements
        );
    }
};
</script>


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
    min-width: 75px;
}
.attr-btn:last-child {
    margin-right: 0;
}
</style>
