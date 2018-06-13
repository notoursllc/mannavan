<script>
import IconArrowUp from '@/components/icons/IconArrowUp';
import IconArrowDown from '@/components/icons/IconArrowDown';

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

    components: {
        IconArrowUp,
        IconArrowDown
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
        <a @click="changeSort()" class="underlineDotted"><slot></slot></a>
        <span class="inlineBlock vam pls" v-show="this.attribute === this.sortData.orderBy">
            <icon-arrow-up icon-name="sort-asc" icon-color="#409EFF" width="16px" v-show="this.orderDir === 'ASC'" />
            <icon-arrow-down icon-name="sort-desc" icon-color="#409EFF" width="16px" v-show="this.orderDir === 'DESC'" />
        </span>
    </span>
</template>
