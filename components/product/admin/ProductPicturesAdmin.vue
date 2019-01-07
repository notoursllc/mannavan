<script>
import Vue from 'vue'
import { Notification, MessageBox, Upload, Dialog, Button, Input, InputNumber, Checkbox, Select, Option, Table, TableColumn } from 'element-ui'
import forEach from 'lodash.foreach'
import Validations from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import FormRow from '@/components/FormRow'
import IconCheckSquare from '@/components/icons/IconCheckSquare'
import IconTrash from '@/components/icons/IconTrash'
import IconPencil from '@/components/icons/IconPencil'
import product_mixin from '@/mixins/product_mixin'

Vue.prototype.$notify = Notification;
Vue.prototype.$confirm = MessageBox.confirm;

Vue.use(Upload);
Vue.use(Button);
Vue.use(Dialog);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(Checkbox);
Vue.use(Select);
Vue.use(Option);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Validations)

let currentNotification = null;
const picModalFormDefaults = {
    is_visible: true,
    sort_order: 1
};


function showNotification(Notification) {
    if(currentNotification) {
        currentNotification.close();
    }
    currentNotification = Notification
}


export default {
    components: {
        FormRow,
        IconCheckSquare,
        IconPencil,
        IconTrash
    },

    props: {
        productId: {
            type: String,
            required: false
        },
    },

    mixins: [
        product_mixin
    ],

    data() {
        return {
            product: {},
            picModal: {
                isActive: false,
                form: {},
                tempImage: null
            },
            picViewModal: {
                isActive: false,
                pic: {}
            }
        }
    },

    validations: function() {
        return {
            picModal: {
                form: {
                    is_visible: {},
                    sort_order: { required },
                    file_name: {} // no validation needed
                }
            }
        }
    },

    methods: {
        onFileChange(e) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length) {
                return;
            }
            this.picModal.form.file = files[0];
            this.createTempImage(this.picModal.form.file);
        },

        createTempImage(file) {
            var image = new Image();
            var reader = new FileReader();
            var vm = this;

            reader.onload = (e) => {
                vm.picModal.tempImage = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        deleteTempImage() {
            this.picModal.tempImage = null;
        },


        async getProduct() {
            if(!this.productId) {
                return;
            }

            try {
                this.product = await this.getProductById(this.productId, { viewAllRelated: true });

                if(!this.product) {
                    throw new Error(this.$t('Product not found'));
                }
            }
            catch(e) {
                showNotification(
                    this.$notify({
                        type: 'error',
                        title: e.message,
                        duration: 0
                    })
                );
            }
        },


        async deletePic(pic) {
            try {
                let picName = this.$t(pic.url);

                await this.$confirm(`Remove this picture from the product? "${ picName }"`, 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                try {
                    const pictureJson = await this.deleteProductPicture(pic.id);

                    if(!pictureJson) {
                        throw new Error(this.$t('Product picture not found'));
                    }

                    this.getProduct();

                    this.$emit('updated');

                    showNotification(
                        this.$notify({
                            type: 'success',
                            title: 'Picture deleted:',
                            message: picName,
                            duration: 3000
                        })
                    );

                }
                catch(e) {
                    showNotification(
                        this.$notify({
                            type: 'error',
                            title: e.message,
                            duration: 0
                        })
                    )
                }
            }
            catch(e) {
                // DO NOTHING
            }
        },


        async savePic(pictureId) {
            let promise = null;
            let formData = new FormData();
            let whitelist = [
                'id',
                'sort_order',
                'is_visible',
                'file',
                'product_id'
            ];

            forEach(this.picModal.form, (val, key) => {
                if(whitelist.indexOf(key) > -1) {
                    formData.append(key, val);
                }
            });

            if(!formData.get('product_id')) {
                formData.append('product_id', this.product.id);
            }

            try {
                const picJson = await this.upsertProductPicture(formData);

                this.picModal.isActive = false;
                this.getProduct();
                this.deleteTempImage();

                this.$emit('updated');

                showNotification(
                    this.$notify({
                        type: 'success',
                        title: 'Picture saved',
                        message: picJson.url,
                        duration: 3000
                    })
                )
            }
            catch(e) {
                showNotification(
                    this.$notify({
                        type: 'error',
                        title: e.message,
                        duration: 0
                    })
                )
            }
        },


        openPicEditModal(pic) {
            this.picModal.form = pic || picModalFormDefaults;
            this.picModal.isActive = true;
        },


        openPicQuickView(pic) {
            this.picViewModal.pic = pic;
            this.picViewModal.isActive = true;
        }
    },

    created() {
        const unwatch = this.$watch('productId', val => {
            if(val) {
                this.getProduct();
                unwatch();
            }
        }, {immediate: true})
    }
}
</script>


<template>
    <div v-cloak>
        <div class="tar mbm">
            <el-button type="primary"
                       @click="openPicEditModal()">ADD PICTURE</el-button>
        </div>

        <el-table
            :data="product.pics"
            class="widthAll">

            <!-- picture -->
            <el-table-column
                label="Picture"
                width="100">
                <template slot-scope="scope">
                    <a @click="openPicQuickView(scope.row)" v-if="scope.row.url">
                        <img :src="scope.row.url" class="width50" />
                    </a>
                </template>
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
                        @click="openPicEditModal(scope.row)">
                        <icon-pencil
                            icon-name="edit"
                            class-name="fillWhite"
                            width="15px" />
                    </el-button>

                    <el-button
                        type="danger"
                        round
                        @click="deletePic(scope.row)"
                        class="mrl">
                        <icon-trash
                            icon-name="delete"
                            class-name="fillWhite"
                            width="15px" />
                    </el-button>
                </div>
            </el-table-column>

            <!-- url -->
            <el-table-column
                prop="url"
                label="URL"></el-table-column>

            <!-- sort order -->
            <el-table-column
                prop="sort_order"
                label="Sort order"
                width="120"></el-table-column>

            <!-- is visible -->
            <el-table-column
                prop="is_visible"
                label="Visible"
                width="120">
                <template slot-scope="scope" v-if="scope.row.is_visible">
                    <icon-check-square
                        icon-name="checked"
                        class-name="fillGreen"
                        width="15px" />
                </template>
            </el-table-column>
        </el-table>


        <!-- product pic dialog -->
        <el-dialog :title="picViewModal.pic.url"
                   :visible.sync="picViewModal.isActive"
                   :modal-append-to-body="false"
                   width="95%">
            <div class="tac">
                <img :src="picViewModal.pic.url" />
            </div>
        </el-dialog>


        <!-- product picture edit dialog -->
        <el-dialog :title="picModal.form.file_name ? 'Edit picture \''+picModal.form.file_name+'\'' : 'Add picture'"
                   :visible.sync="picModal.isActive"
                   :modal-append-to-body="false">

            <!-- Is visible -->
            <form-row label="Is visible:">
                <el-checkbox v-model="picModal.form.is_visible"></el-checkbox>
            </form-row>

            <!-- Sort order -->
            <form-row label="Sort order:">
                <el-input-number
                    v-model="picModal.form.sort_order"
                    controls-position="right"
                    :step="1"></el-input-number>
                <p role="alert" v-show="$v.picModal.form.sort_order.$invalid">{{ $t('Required') }}</p>
            </form-row>

            <!-- Current picture -->
            <form-row label="Current picture:" v-if="picModal.form.file_name">
                <img :src="picModal.form.url" width="200" />
            </form-row>

            <!-- Upload picture -->
            <form-row :label="picModal.form.file_name ? 'Replacement picture:' : 'Upload picture:'">
                <div v-if="!picModal.tempImage">
                    <input type="file" ref="file" @change="onFileChange" />
                </div>
                <div v-else class="mtm">
                    <img :src="picModal.tempImage" width="200" />
                    <div class="colorRed tal vat">
                        <span class="cursorPointer" @click="deleteTempImage()">
                            <icon-trash
                                icon-name="delete"
                                class-name="fillRed"
                                class="vam"
                                width="15px" /> remove
                        </span>
                    </div>
                </div>
            </form-row>

            <!-- buttons -->
            <form-row label="">
                <div class="ptl nowrap">
                    <el-button
                        type="primary"
                        class="mrm"
                        @click="savePic(picModal.form.id)"
                        :disabled="$v.picModal.form.$invalid">SAVE</el-button>
                    <el-button @click="picModal.isActive = false">CANCEL</el-button>
                </div>
            </form-row>
        </el-dialog>
    </div>
</template>
