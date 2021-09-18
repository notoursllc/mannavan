// import { joinURL } from 'ufo';
// import {} from '~image'

export function getImage(src, { modifiers, baseURL } = {}, { options, nuxtContext, $img }) {
    // const { width, height, format, fit, ...providerModifiers } = modifiers;
    const { width } = modifiers;

    const cloudflareVariants = [
        45,
        75,
        320,
        640,
        768,
        1024,
        1280,
        1536
    ];

    const modifierWidth = width ? parseInt(width, 10) : 640;

    // get the closest cloudflare variant to the specified width
    const closest = cloudflareVariants.reduce(function(prev, curr) {
        return (Math.abs(curr - modifierWidth) < Math.abs(prev - modifierWidth) ? curr : prev);
    });

    const operations = [];
    // process modifiers
    const operationsString = operations.join(',');

    const cloudflareId = src.replace(/^\/|\/$/g, ''); // remove beginning and trailing slash

    return {
        // url: joinURL(baseURL, operationsString, src)
        url: `https://imagedelivery.net/onkdurJr24OykoZY1xYs4g/${cloudflareId}/w${closest}`
    };
}
