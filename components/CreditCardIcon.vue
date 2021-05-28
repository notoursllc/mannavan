<script>
let supportedCardIcons = ['americanExpress', 'discoverDiners', 'discover', 'JCB', 'maestro', 'masterCard', 'paypal', 'visa'];

export default{
    props: {
        cardType: {
            type: String,
            default: ''
        }
    },

    computed: {
        cardTypeIcon: function() {
            // let type = this.cardType ? this.cardType.toLowerCase() : null;
            // if(supportedCardIcons.indexOf(type) > -1) {
            //     return `/images/creditcards/${type}.png`;
            // }
            return null;
        }
    }
}
</script>


<template>
    <img class="ccIcon" :src="cardTypeIcon" v-show="cardTypeIcon" />
</template>


<style>
    .ccIcon {
        width: 45px;
        vertical-align: top;
    }
</style>
