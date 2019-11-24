<script>
export default {
    name: 'PaginationBar',

    props: {
        total: {
            type: Number,
        },

        currentPage: {
            type: Number,
        }
    },

    data: function() {
        return {
        }
    },

    methods: {

    }
}
</script>


<template>
    <div class="pagination-bar">
        <div class="pagination-bar-info"></div>
        <div class="pagination-bar-pager">
            <el-pagination
                background
                layout="prev, pager, next"
                :total="total"
                :current-page="currentPage"
                small>
            </el-pagination>
        </div>
    </div>
</template>

<style lang="scss">
@import "~assets/css/components/_mixins.scss";

.pagination-bar {
    margin-bottom: 10px;
    @include flexbox();
    @include flex-direction(row);

    .pagination-bar-info {
        @include flex(1 1 auto);
        @include align-items(flex-start);
    }

    .pagination-bar-pager {
        @include flex(0);
    }
}
</style>
