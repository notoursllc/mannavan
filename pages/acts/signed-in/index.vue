<script>
import { setToken, checkSecret, extractInfoFromHash } from '@/utils/auth';

export default {
    layout: 'admin',

    mounted () {
        const { token, secret } = extractInfoFromHash();

        if (!checkSecret(secret) || !token) {
            console.error('Something happened with the Sign In request')
        }

        setToken(token);
        this.$router.replace('/acts/product/list')
    }
}
</script>

<template>
    <div class="tac mtl">Signing in...</div>
</template>
