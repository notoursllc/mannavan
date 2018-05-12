<script>
import { unsetToken } from '@/utils/auth';
import { logout } from '@/utils/lock';

export default {
    layout: 'admin',

    mounted () {
        unsetToken();
        logout();
    }
}
</script>

<template>
    <div class="tac mtl">Signing off...</div>
</template>
