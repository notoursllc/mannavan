<script>
export default {
    name: 'PageTitle'
};
</script>

<template>
    <div class="pageTitle">
        <h1><slot></slot></h1>
    </div>
</template>

<style scoped>
.pageTitle {
    max-width: 1440px;
    margin: 0 auto;
    padding: 20px 0;
}

.pageTitle h1 {
    max-width: 1440px;
    font-size: 20px;
    font-weight: 500;
    padding: 0;
    margin: 0;
}
</style>
