<script>
    export default {
        props: {
            width: {
                type: String,
                default: '200px'
            }
        }
    }
</script>


<template>
    <div class="bottomPopover" :style="{'width': width}">
        <div class="arrow"></div>
        <slot></slot>
    </div>
</template>


<style lang="scss">
    @import "../assets/css/components/_mixins.scss";

    .bottomPopover {
        display: table;
        margin: 0 auto;
        background-color: #525151;
        color: #fff;
        padding: 10px;
        font-size: 13px;
        position: relative;
        top: 10px;
        width: 200px;
        @include box-shadow(2px, 2px, 5px);

        .arrow {
            width: 0; 
            height: 0; 
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 10px solid #525151;
            position: absolute;
            top: -7px;
            right: 45%;
        }
    }
</style>