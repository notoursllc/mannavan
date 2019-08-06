<script>
import forEach from 'lodash.foreach'
import { required } from 'vuelidate/lib/validators'
import product_mixin from '@/mixins/product_mixin'


const picModalFormDefaults = {
    is_visible: true,
    sort_order: 1
};


export default {
    components: {
        FormRow: () => import('@/components/FormRow'),
        IconCheckSquare: () => import('@/components/icons/IconCheckSquare'),
        IconTrash: () => import('@/components/icons/IconTrash'),
        OperationsDropdown: () => import('@/components/OperationsDropdown')
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
                    this.$errorMessage(
                        this.$t('Product not found'),
                        { closeOthers: true }
                    );
                }
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                );
            }
        },


        async deletePic(pic) {
            try {
                await this.$confirm(`Remove this picture from the product? "${ pic.url }"`, 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                try {
                    const pictureJson = await this.deleteProductPicture(pic.id);

                    if(!pictureJson) {
                        this.$errorMessage(
                            this.$t('Product picture not found'),
                            { closeOthers: true }
                        );
                        return;
                    }

                    this.getProduct();

                    this.$emit('updated');

                    this.$successMessage(
                        `Picture deleted:<br/><br/>${pic.url}`,
                        { dangerouslyUseHTMLString: true }
                    )
                }
                catch(err) {
                    this.$errorMessage(
                        err.message,
                        { closeOthers: true }
                    );
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

                this.$successMessage('Picture saved')
            }
            catch(err) {
                this.$errorMessage(
                    err.message,
                    { closeOthers: true }
                )
            }
        },


        openPicEditModal(pic) {
            this.picModal.form = Object.assign({}, pic) || picModalFormDefaults;
            this.picModal.isActive = true;
        },


        openPicQuickView(pic) {
            this.picViewModal.pic = Object.assign({}, pic);
            this.picViewModal.isActive = true;
        }
    },

    created() {
        this.$watch('productId', val => {
            if(val) {
                this.getProduct();
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
                width="150">
                <template slot-scope="scope">
                    <span v-if="scope.row.url">
                        <img :src="scope.row.url" class="width50" />
                    </span>
                    <operations-dropdown
                        class="vat"
                        @view="openPicQuickView(scope.row)"
                        @edit="openPicEditModal(scope.row)"
                        @delete="deletePic(scope.row)" />
                </template>
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
            <form-row>
                <template slot="label">Is visible:</template>
                <template slot="value">
                    <el-checkbox v-model="picModal.form.is_visible" />
                </template>
            </form-row>

            <!-- Sort order -->
            <form-row>
                <template slot="label">Sort order:</template>
                <template slot="value">
                    <el-input-number
                        v-model="picModal.form.sort_order"
                        controls-position="right"
                        :step="1" />
                    <p role="alert"
                        v-show="$v.picModal.form.sort_order.$invalid">{{ $t('Required') }}</p>
                </template>
            </form-row>

            <!-- Current picture -->
            <form-row v-if="picModal.form.file_name">
                <template slot="label">Current picture:</template>
                <template slot="value">
                    <img :src="picModal.form.url" width="200" />
                </template>
            </form-row>

            <!-- Upload picture -->
            <form-row>
                <template slot="label">
                    {{ picModal.form.file_name ? 'Replacement picture:' : 'Upload picture:' }}:
                </template>
                <template slot="value">
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
                </template>
            </form-row>

            <!-- buttons -->
            <form-row>
                <template slot="value">
                    <div class="ptl nowrap">
                        <el-button
                            type="primary"
                            class="mrm"
                            @click="savePic(picModal.form.id)"
                            :disabled="$v.picModal.form.$invalid">SAVE</el-button>
                        <el-button @click="picModal.isActive = false">CANCEL</el-button>
                    </div>
                </template>
            </form-row>
        </el-dialog>
    </div>
</template>
