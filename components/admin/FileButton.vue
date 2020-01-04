<script>
export default {
    name: 'FileButton',

    props: {
        type: {
            type: String,
            default: 'primary'
        },

        size: {
            type: String,
            default: 'small'
        },

        multiple: {
            type: Boolean,
            default: false
        },

        disabled: {
            type: Boolean,
            default: false
        },

        accept: {
            type: String,
            default: ''
        },
    },

    computed: {
        buttonClass() {
            let classes = [
                `el-button--${this.type}`,
                `el-button--${this.size}`
            ];

            if(this.disabled) {
                classes.push('is-disabled')
            }

            return classes.join(' ');
        }
    },

    methods: {
        onFileChange(e) {
            this.$emit('change', e.target.files || e.dataTransfer.files);

            // resetting the value so the same file can be uploaded sequentially if desired
            // (without this, the change event wont trigger the second time)
            this.$refs.myFiles.value = '';
        }
    }
}
</script>


<template>
    <label class="file-select">
        <div class="el-button" :class="buttonClass">
            <slot>Select File</slot>
        </div>
        <input
            ref="myFiles"
            type="file"
            :multiple="multiple"
            :accept="accept"
            :disabled="disabled"
            @change="onFileChange" />
    </label>
</template>

<style scoped>
.file-select > .select-button {
    padding: 1rem;
    color: white;
    background-color: #2EA169;
    border-radius: .3rem;
    text-align: center;
    font-weight: bold;
}

.file-select > input[type="file"] {
    display: none;
}
</style>
