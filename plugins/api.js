import { BreadvanApi } from '@notoursllc/figleaf';

export default (context, inject) => {

    const api = BreadvanApi(context.$axios);
    inject('api', { ...api });

};
