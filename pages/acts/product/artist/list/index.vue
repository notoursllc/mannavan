<script>
import Vue from 'vue'
import { Notification, MessageBox, Button, Table, TableColumn, Breadcrumb, BreadcrumbItem } from 'element-ui'
import forEach from 'lodash.foreach'
import product_mixin from '@/mixins/product_mixin'
import IconTrash from '@/components/icons/IconTrash'
import IconPencil from '@/components/icons/IconPencil'

Vue.use(Button);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem);

Vue.prototype.$notify = Notification;
Vue.prototype.$confirm = MessageBox.confirm;

let currentNotification = null;


function showNotification(Notification) {
    if(currentNotification) {
        currentNotification.close();
    }
    currentNotification = Notification
}


export default {
    middleware: [
        'authenticated'
    ],

    layout: 'admin',

    components: {
        IconPencil,
        IconTrash
    },

    mixins: [
        product_mixin
    ],

    data() {
        return {
            artists: [],
            sortData: {
                orderBy: 'updated_at',
                orderDir: 'DESC'
            }
        }
    },

    async asyncData({ params, store, app }) {
        const artists = await product_mixin.methods.getProductArtists.call(app, {
            // where: ['is_available', '=', true],
            // andWhere: [
            //     ['inventory_count', '>', 0]
            // ],
            orderBy: 'updated_at',
            orderDir: 'DESC'
        });

        return {
            artists
        }
    },

    methods: {
        async fetchArtists() {
            this.artists = await this.getProductArtists({
                // where: ['is_available', '=', true],
                // whereRaw: ['sub_type & ? > 0', [productTypeId]],
                // andWhere: [
                //     ['inventory_count', '>', 0]
                // ],
                ...this.sortData
            });
        },

        sortChanged(val) {
            this.sortData.orderBy = val.prop || 'updated_at';
            this.sortData.orderDir = val.order === 'ascending' ? 'ASC' : 'DESC';
            this.fetchArtists();
        },

        async deleteArtist(id, name) {
            try {
                await this.$confirm(`Delete "${ name || id }"?`, 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                let resposne = await this.getProductsForArtist(id);

                // Don't delete the artist if it is related to any products
                if(resposne.pagination.rowCount) {
                    showNotification(
                        this.$notify({
                            type: 'error',
                            title: 'Error deleting artist',
                            message: `"${ name || id }" can not be deleted because the artist is assigned to ${resposne.pagination.rowCount} products`,
                            duration: 0
                        })
                    );
                    return;
                }

                await this.deleteProductArtist(id);

                showNotification(
                    this.$notify({
                        type: 'success',
                        title: `"${ name || id }" deleted successfully`,
                        duration: 3000
                    })
                );

                this.fetchArtists();
            }
            catch(err) {
                // Do nothing
            }
        }
    }
}
</script>


<template>
    <div>
        <div class="pal">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ name: 'acts-product-artist-list' }">Product Artists</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <div class="pal">
            <div class="tar mbl">
                <el-button type="primary" @click="goToProductArtistUpsert()">ADD ARTIST</el-button>
            </div>

            <el-table
                :data="artists"
                class="widthAll"
                @sort-change="sortChanged">

                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <pre style="overflow-x:scroll">{{ scope.row | formatJson }}</pre>
                    </template>
                </el-table-column>

                <!-- name -->
                <el-table-column
                    prop="name"
                    label="Name"
                    sortable="custom">
                    <template slot-scope="scope">
                        <div>{{ scope.row.name }}</div>
                    </template>
                </el-table-column>

                <!-- email -->
                <el-table-column
                    prop="email"
                    label="Email"
                    sortable="custom">
                    <template slot-scope="scope">
                        <div>{{ scope.row.email }}</div>
                    </template>
                </el-table-column>

                <!-- description short -->
                <el-table-column
                    prop="description_short"
                    label="Short Description">
                </el-table-column>

                <!-- operations -->
                <el-table-column
                    label="Operations"
                    align="center"
                    width="150">
                    <div slot-scope="scope" class="nowrap">
                        <el-button
                            type="primary"
                            round
                            @click="goToProductArtistUpsert(scope.row.id)">
                            <icon-pencil
                                icon-name="edit"
                                class-name="fillWhite"
                                width="15px" />
                        </el-button>

                        <el-button
                            type="danger"
                            round
                            @click="deleteArtist(scope.row.id, scope.row.name)"
                            class="mrl">
                            <icon-trash
                                icon-name="delete"
                                class-name="fillWhite"
                                width="15px" />
                        </el-button>
                    </div>
                </el-table-column>
            </el-table>

        </div>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_table.scss";
</style>
