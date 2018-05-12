<script>
    export default {
        data: function() {
            return {
                year: new Date().getFullYear()
            }
        }
    }
</script>


<template>
    <footer class="footer">
        <div class="container level">
            <div class="level-item">
                <nuxt-link :to="{name: 'returns'}">{{ $t('Returns / Exchanges') }}</nuxt-link>
            </div>

            <div class="level-item">
                <div class="tar fs12">
                    &#169; {{ year }} gmnst.com, {{ $t('All Rights Reserved') }}.
                    <span class="underline"><nuxt-link :to="{name: 'privacy'}">{{ $t('Privacy') }}</nuxt-link></span> and
                    <span class="underline"><nuxt-link :to="{name: 'conditions-of-use'}">{{ $t('Conditions') }}</nuxt-link></span>
                </div>
            </div>
        </div>
    </footer>
</template>


<style lang="scss">
    @import "../assets/css/components/_variables.scss";

    .footer {
        // background-color: $colorBluePurple;
        background-color: #fff;
        padding: 10px 20px;
        color: #000;

        a:hover {
            text-decoration: none;
        }
    }
</style>
