<script>
import Vue from 'vue'

export default {
    props: {
        product: {
            type: Object,
            required: true
        }
    }
}
</script>


<template>
    <div>
        <div class="g-spec">
            <div class="g-spec-label">JSON</div>
            <div class="g-spec-content">
                <pre style="overflow-x:scroll; max-width:1200px">{{ product | formatJson }}</pre>
            </div>
        </div>

        <div class="g-spec">
            <div class="g-spec-label">Pictures</div>
            <div class="g-spec-content">
                <div v-for="pic in product.pics" :key="pic.id" class="inlineBlock mrl vat">
                    <img :src="pic.url" class="prodPic">
                    <div>{{ pic.url }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    .prodPic {
        width: 400px;
    }

    .tree-view-item-leaf {
        white-space: normal !important;
    }
</style>
