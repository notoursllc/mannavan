<script>
    export default{
        props: {
            attribute: {
                type: String,
                required: true
            },
            sortData: {
                type: Object,
                required: true
            }
        },

        data: function() {
            return {
                orderDir: 'DESC'
            }
        },

        methods: {
            changeSort() {
                this.orderDir = (this.orderDir === 'DESC' ? 'ASC' : 'DESC');

                this.$emit('change', {
                    orderBy: this.attribute,
                    orderDir: this.orderDir
                })
            }
        },

        created: function() {
            this.orderDir = this.sortData.orderDir || 'DESC';
        }
    }
</script>


<template>
    <span>
        <a @click="changeSort()"><slot></slot></a>
        <i class="mls vam notours"
           v-bind:class="{ 'icon-angle-down': this.orderDir === 'DESC', 'icon-angle-up': this.orderDir === 'ASC' }"
           v-show="this.attribute === this.sortData.orderBy"
           aria-hidden="true"></i>
    </span>
</template>
