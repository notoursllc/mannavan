import Vue from 'vue';
import FigIcon from '@notoursllc/figleaf/components/icon/FigIcon';

export default (context) => {

    // context.app.nuxt.$on('fig::confirm::hide', () => {
    //     console.log("on hide")
    // });
    // console.log(context.app.nuxt)

    /**
     * Show the confirm dialog
     *
     * @param String,VNode message
     * @param {*} config
     * @return Promise
     */
    Vue.prototype.$showConfirm = function(message, variant, config) {
        const cfg = Object.assign(
            {},
            {
                okLabel: this.$t('OK'),
                cancelLabel: this.$t('Cancel')
            },
            config
        );

        const h = this.$createElement;
        let childNode = null;
        let icon = null;

        switch(variant) {
            case 'warning':
                icon = 'alert-circle';
        }

        if(icon) {
            childNode = h(
                'div',
                {
                    class: ['pr-3']
                },
                [
                    h(
                        FigIcon,
                        {
                            attrs: {
                                icon: icon,
                                width: 35,
                                height: 35,
                                variant: 'warning'
                            }
                        }
                    )
                ]
            );
        }

        if(childNode) {
            const messageVNode = h(
                'div',
                {
                    class: ['flex items-center justify-center']
                },
                [
                    childNode,
                    h(
                        'div',
                        {
                            class: 'text-left'
                        },
                        [message]
                    )
                ]);

            return this.$figleaf.confirm(
                [messageVNode],
                cfg
            );
        }

        return this.$figleaf.confirm(message, cfg);
    };

};
