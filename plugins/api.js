import Products from '@/api/products';
import ProductSkuOptions from '@/api/product_sku_options';
import Storage from '@/api/storage';
import MasterTypes from '@/api/master_types';


export default (context, inject) => {

    // Initialize API repositories
    const repositories = {
        products: Products(context.$axios),
        productSkuOptions: ProductSkuOptions(context.$axios),
        storage: Storage(context.$axios),
        masterTypes: MasterTypes(context.$axios)
    };

    inject('api', repositories);

};
