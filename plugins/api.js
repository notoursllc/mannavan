import Products from '@/api/products';
import ProductAccentMessages from '@/api/product_accent_messages';
import Storage from '@/api/storage';
import MasterTypes from '@/api/master_types';
import Cart from '@/api/cart';


export default (context, inject) => {

    // Initialize API repositories
    const repositories = {
        products: Products(context.$axios),
        productAccentMessages: ProductAccentMessages(context.$axios),
        storage: Storage(context.$axios),
        masterTypes: MasterTypes(context.$axios),
        cart: Cart(context.$axios)
    };

    inject('api', repositories);

};
