import Products from '@/api/products';
import ProductAccentMessages from '@/api/product_accent_messages';
import Storage from '@/api/storage';
import MasterTypes from '@/api/master_types';
import Cart from '@/api/cart';
import Core from '@/api/core';


export default (context, inject) => {

    // Initialize API repositories
    const repositories = {
        cart: Cart(context.$axios),
        core: Core(context.$axios),
        masterTypes: MasterTypes(context.$axios),
        productAccentMessages: ProductAccentMessages(context.$axios),
        products: Products(context.$axios),
        storage: Storage(context.$axios)
    };

    inject('api', repositories);

};
