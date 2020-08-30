

<script>
export default {
    name: 'SvgIcon',

    functional: true,

    render(h, ctx) {
        const classes = ['icon', ctx.data.staticClass];

        if(ctx.props.spin) {
            classes.push('icon-spin');
        }

        const icon = ctx.props.icon;

        // delete the 'icon' prop... no need to add that prop to the attributes:
        delete ctx.props.icon;

        const attributes = {
            width: 20,
            height: 20,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'aria-hidden': 'true',
            role: 'presentation',
            focusable: 'false',
            fill: 'none',
            'data-icon': icon // adding this allow for special case css styling, tests, etc
        };

        Object.keys(ctx.props).forEach((prop) => {
            const val = ctx.props[prop];

            switch(prop) {
                case 'strokeWidth':
                    attributes['stroke-width'] = val;
                    break;

                case 'strokeLinecap':
                    attributes['stroke-linecap'] = val;
                    break;

                case 'strokeLinejoin':
                    attributes['stroke-linecap'] = val;
                    break;

                // everything else is free to be added as-is
                default:
                    attributes[prop] = val;
            }
        });

        if(!attributes.stroke && (!attributes.fill || attributes.fill === 'none')) {
            let strokeColor = '#565656';

            switch(ctx.props.variant) {
                case 'warning':
                    strokeColor = '#e6a23c';
                    break;

                case 'danger':
                    strokeColor = '#e55353';
                    break;

                case 'success':
                    strokeColor = '#2eb85c';
                    break;
            }

            attributes.stroke = strokeColor;
        }
        if(attributes.stroke && !attributes['stroke-width']) {
            attributes['stroke-width'] = '2px';
        }

        return h(
            'svg',
            {
                class: classes,
                on: ctx.listeners,
                attrs: attributes
            },
            [
                h(
                    'use',
                    {
                        attrs: {
                            'xlink:href': `#${icon}`
                        }
                    }
                )
            ]
        );
    }
};
</script>
