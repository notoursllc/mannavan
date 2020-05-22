import MasterTypes from '@/api/master_types';
import Products from '@/api/products';
import ProductSkuOptions from '@/api/product_sku_options';
import Storage from '@/api/storage';


export default (context, inject) => {

    // Initialize API repositories
    const repositories = {
        masterTypes: MasterTypes(context.$axios),
        products: Products(context.$axios),
        productSkuOptions: ProductSkuOptions(context.$axios),
        storage: Storage(context.$axios)
    };

    inject('api', repositories);

};
