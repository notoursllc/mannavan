<script>
export default {
    name: 'PiioElement',

    props: {
        path: {
            type: String,
            default: ''
        },
        tag: {
            type: String,
            default: 'div'
        }
    },

    computed: {
        cTag: function () {
            return this.tag.toLowerCase();
        }
    },

    render: function(createElement) {
        switch(this.cTag) {
            case 'img':
            case 'source':
                return createElement(
                    this.cTag,
                    {
                        attrs: {
                            'data-piio': this.path,
                            'src': 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
                        }
                    }
                );

            default:
                return createElement(
                    this.cTag,
                    {
                        attrs: {
                            'data-piio-bck': this.path
                        }
                    },
                    this.$slots.default
                );
        }
    }
};
</script>
