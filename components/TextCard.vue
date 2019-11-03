<script>
export default {
    name: 'TextCard'
}
</script>

<template>
    <div class="textCard">
        <div class="textCardHeader">
            <slot name="header"></slot>
        </div>
        <div class="textCardContent">
            <slot></slot>
        </div>
    </div>
</template>


<style lang="scss" scoped>
@import "~assets/css/components/_mixins.scss";

.textCard {
    box-shadow: 0 0 0 1px rgba(63,63,68,.05), 0 1px 3px 0 rgba(63,63,68,.15);
    background-color: #fff;

    .textCardHeader {
        padding: 12px 20px;
        border-bottom: 1px solid #EBEEF5;
        font-weight: 500;
    }
    .textCardContent {
        padding: 15px 20px;
    }
}
</style>
