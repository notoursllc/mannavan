<script>
export default{
    props: {
        label: {
            type: String,
            default: ''
        }
    }
}
</script>


<template>
    <div class="formRow">
        <label>{{ label }}</label>
        <span>
            <slot></slot>
        </span>
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
        font-size: 14px;
        font-weight: bold;
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