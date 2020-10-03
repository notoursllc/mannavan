<script>
import Vue from 'vue';

export default Vue.extend({
    name: 'BvButton',

    props: {
        as: {
            type: String,
            default: 'button'
        },
        size: {
            type: String,
            default: 'md',
            validator: (value) => {
                return ['sm', 'md', 'lg'].includes(value);
            }
        },
        variant: {
            type: String,
            default: 'plain-outline',
            validator: (value) => {
                return ['primary', 'primary-outline', 'success', 'success-outline', 'danger', 'danger-outline', 'plain-outline', 'ghost'].includes(value);
            }
        },
        type: {
            type: String,
            default: 'button',
            validator: (value) => {
                return ['button', 'submit', 'reset'].includes(value);
            }
        },
        isDisabled: {
            type: Boolean,
            default: false
        },
        isLoading: {
            type: Boolean,
            default: false
        }
    },

    computed: {
        classNames() {
            return [
                'btn',
                `btn-${this.variant}`
            ];
        }
    },

    render(h) {
        const children = [];

        if(this.$slots.icon) {
            children.push(
                h(
                    'div',
                    {
                        class: 'inlineBlock'
                    },
                    this.$slots.icon
                )
            );
        }

        children.push(this.$slots.default);

        return h(
            'button',
            {
                class: this.classNames,
                props: this.$props,
                attrs: {
                    type: this.type,
                    tabIndex: 0,
                    disabled: this.isDisabled || this.isLoading,
                    'aria-disabled': this.isDisabled || this.isLoading
                },
                on: {
                    click: ($event) => this.$emit('click', $event)
                }
            },
            children
        );
    }
});
</script>


<style lang="scss" scoped>
@import "~assets/css/components/_variables.scss";

.btn {
    display: inline-block;
    font-weight: 400;
    color: $gray-900;
    text-align: center;
    vertical-align: middle;
    background-color: transparent;
    border: 1px solid transparent;
    padding: .375rem .75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 2px;
}

.btn:not(:disabled):not(.disabled) {
    cursor: pointer;
}

// DANGER
.btn-danger {
    color: $white;
    background-color: $red-400;
    border-color: $red-400;

    &:hover {
        background-color: $red-500;
        border-color: $red-500;
    }
}
.btn-danger-outline {
    color: $red-500;
    border-color: $red-400;

    &:hover {
        color: $white;
        background-color: $red-400;
    }
}

// GHOST
.btn-ghost {
    color: $blue-600;

    &:hover {
        background-color: $blue-50;
    }
}

// PRIMARY
.btn-plain {
    color: $black;
    background-color: $gray-500;
    border-color: $gray-500;

    &:hover {
        color: $white;
        background-color: $gray-600;
        border-color: $gray-600;
    }
}
.btn-plain-outline {
    color: $gray-700;
    border-color: $gray-400;

    &:hover {
        border-color: $gray-500;
        background-color: $gray-200;
    }
}

// PRIMARY
.btn-primary {
    color: $white;
    background-color: $blue-400;
    border-color: $blue-400;

    &:hover {
        background-color: $blue-500;
        border-color: $blue-500;
    }
}
.btn-primary-outline {
    color: $blue-600;
    border-color: $blue-300;

    &:hover {
        color: $white;
        background-color: $blue-400;
        border-color: $blue-500;
    }
}

// SUCCESS
.btn-success {
    color: $white;
    background-color: $green-500;
    border-color: $green-500;

    &:hover {
        color: $white;
        background-color: $green-600;
        border-color: $green-600;
    }
}
.btn-success-outline {
    color: $green-600;
    border-color: $green-500;

    &:hover {
        color: $white;
        background-color: $green-500;
    }
}
</style>
