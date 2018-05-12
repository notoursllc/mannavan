<script>
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'

export default {
    components: {
        AppHeader,
        AppFooter
    },
}
</script>

<template>
    <div class="layoutContainer">
        <app-header></app-header>
        <main>
            <nuxt/>
        </main>
        <app-footer></app-footer>
    </div>
</template>
