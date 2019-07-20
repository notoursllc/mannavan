<script>
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
        <pre style="overflow-x:scroll">{{ product | formatJson }}</pre>

        <div class="mtl">
            <div v-for="pic in product.pics" :key="pic.id" class="inlineBlock mrl vat prodPic">
                <img :src="pic.url">
                <div>{{ pic.url }}</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    .prodPic {
        width: 400px;
        overflow-wrap: break-word;
    }

    .tree-view-item-leaf {
        white-space: normal !important;
    }
</style>
