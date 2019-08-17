<script>
export default {
    inheritAttrs: false,

    props: {
        value: {
            type: Number
        },

        min: {
            type: Number,
            required: false,
            default: 1
        },

        max: {
            type: Number,
            required: false,
            default: 30
        }
    },

    computed: {
        numberOptions: function() {
            let opts = [];
            for(var i = this.min; i <= this.max; i++) {
                opts.push(i);
            }
            return opts;
        }
    },

    data() {
        return {
            selectedValue: 1
        }
    },

    methods: {
        emitChange(val) {
            // this.selectedValue = val;
            this.$emit('input', val);
            console.log("NumberSElect emit", val)
        }
    },

    watch: {
        value: {
            handler: function(newVal) {
                this.selectedValue = parseInt(newVal, 10);
            },
            immediate: true
        }
    }
}
</script>


<template>
    <el-select
        v-bind="$attrs"
        v-on="$listeners"
        v-model="selectedValue"
        @change="emitChange"
        @clear="() => { selectedValue = null }"
        class="widthAll">
        <el-option
            v-for="num in numberOptions"
            :key="num"
            :label="num"
            :value="num">
        </el-option>
    </el-select>
</template>
