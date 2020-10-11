import queryString from 'query-string';

function formatParams(params) {
    return queryString.stringify(params, {arrayFormat: 'bracket'});
}


export default ($http) => ({

    async all(params) {
        const { data } = await $http.$get(`/product/sku/accent_messages/all?${formatParams(params)}`);
        return data;
    }

});
