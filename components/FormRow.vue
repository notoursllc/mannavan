<script>
export default {
    props: {
        valueClass: {
            type: Object,
        }
    }
}
</script>


<template>
    <div class="formRow">
        <label><slot name="label"></slot></label>
        <span :class="valueClass"><slot name="value"></slot></span>
    </div>
</template>


<style lang="scss">
    @import "../assets/css/components/_variables.scss";

    .formRow {
        display: table-row;
    }

    .formRow > label,
    .formRow > span {
        display: table-cell;
        padding-bottom: 10px;
        vertical-align: top;
    }

    .formRow > label {
        padding-right: 10px;
    }

    @media #{$small-and-down}  {
        .formRow {
            display: block !important;
            margin-bottom: 10px;
        }

        .formRow > label,
        .formRow > span {
            display: block;
            padding-bottom: 0;
        }
    }
</style>
