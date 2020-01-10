<script>
import Vue from 'vue';
import { Tooltip } from 'element-ui';
import isObject from 'lodash.isobject';

Vue.use(Tooltip);

export default {
    name: 'ImageManager',

    props: {
        value: {
            type: Array,
            default: []
        },

        maxNumImages: {
            type: Number,
            default: 10
        }
    },

    components: {
        AppDialog: () => import('@/components/AppDialog'),
        FileButton: () => import('@/components/admin/FileButton'),
        IconDragHandle: () => import('@/components/icons/IconDragHandle'),
        draggable: () => import('vuedraggable'),
    },

    data() {
        return {
            loading: false,
            dialogImageUrl: '',
            dialogVisible: false,
            fileList: [],
            accept: 'image/png, image/jpeg, image/gif'
        }
    },

    computed: {
        numRemainingUploads() {
            return this.maxNumImages - this.fileList.length;
        }
    },

    methods: {
        emitChange() {
            this.$emit('input', this.fileList)
        },

        onPreview(file) {
            this.dialogImageUrl = file;
            this.dialogVisible = true;
        },

        filesAreAcceptedTypes(files) {
            const acceptedTypes = this.accept.split(',').map((type) => { return type.trim() });
            let isAcceptedType = true;

            for (var i=0; i<files.length; i++) {
                if (acceptedTypes.indexOf(files[i].type) === -1) {
                    isAcceptedType = false;
                }
            }

            return isAcceptedType;
        },

        onFileChange(files) {
            if (!files.length) {
                return;
            }

            if(!this.filesAreAcceptedTypes(files)) {
                throw new Error('File type not allowed')
            }

            this.createTempImages(files);
            this.emitChange();
        },

        createTempImages(files) {
            this.loading = true;

            if(files) {
                // https://stackoverflow.com/a/40902462
                Array.prototype.forEach.call(files, (file) => {
                    let reader = new FileReader();

                    reader.onload = (e) => {
                        this.fileList.push({
                            id: null,
                            image_url: e.target.result,
                            alt_text: null,
                            raw: file,
                            ordinal: this.fileList.length
                        });
                        // console.log("ADDING TO FILELIST", file.name)
                    };

                    reader.readAsDataURL(file);
                });

                this.setOrdinals();
            }

            this.loading = false;
        },

        async onDeleteImage(obj, index) {
            if(obj.hasOwnProperty('id')) {
                // this.loading = true;
                this.$emit('delete', obj.id);
                // await this.$api.storage.deleteImage(obj.image_url);
                // this.loading = false;
            }

            // If this is a newly uploaded image then all we need to do
            // is splice it from the fileList
            this.fileList.splice(index, 1);
            this.setOrdinals();
            this.emitChange();
        },

        setOrdinals() {
            this.fileList.forEach((obj, index) => {
                obj.ordinal = index;
            });
            console.log("SET ORDINALS UPDATE", this.fileList)
        }
    },

    watch: {
        value: {
            handler(newVal) {
                if(Array.isArray(newVal)) {
                    this.fileList = newVal;
                }
            },
            immediate: true,
        }
    }
}
</script>


<template>
    <div v-cloak
        v-loading="loading"
        class="widthAll">

        <draggable
            v-model="fileList"
            ghost-class="ghost"
            handle=".handle"
            @update="setOrdinals">

            <div class="image-row" v-for="(obj, index) in fileList" :key="index">
                <div class="image-row-handle">
                    <i class="handle">
                        <icon-drag-handle
                            icon-name="drag-handle"
                            width="15px"
                            class-name="fillGrayLight" />
                    </i>
                </div>

                <div class="image-row-pic">
                    <img
                        class="cursorPointer"
                        :src="obj.image_url"
                        alt=""
                        @click="onPreview(obj.image_url)" />
                </div>

                <div class="image-row-input">
                    <div class="phm">
                        <el-input
                            v-model="obj.alt_text"
                            class="widthAll"
                            placeholder="Image alt text"
                            @input="emitChange" />
                        <div class="input-tip">{{ $t('Image_alt_text_description') }}</div>
                    </div>

                    <el-popconfirm
                        :hideIcon="true"
                        :title="$t('Delete this item?')"
                        :confirmButtonText="$t('OK')"
                        :cancelButtonText="$t('cancel')"
                        @onConfirm="onDeleteImage(obj, index)">
                        <el-button
                            slot="reference"
                            icon="el-icon-delete" />
                    </el-popconfirm>
                </div>
            </div>

        </draggable>

        <div class="mtm">
            <file-button
                :accept="accept"
                :multiple="true"
                :disabled="numRemainingUploads < 1"
                @change="onFileChange">{{ fileList.length ? $t('Choose another file') : $t('Choose file') }}</file-button>
        </div>

        <app-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
        </app-dialog>

    </div>
</template>

<style lang="scss">
@import "~assets/css/components/_mixins.scss";

.el-upload-list--picture .el-upload-list__item {
    border: 0 !important;
    margin: 5px 0;
    padding: 0;
    height: auto;
}


.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}

.image-row {
    @include flexbox();
}
.image-row-handle {
    @include flexbox();
    @include align-items(center);
    @include flex(0 0 30px);
    padding: 2px 5px 2px 0;

    svg {
        cursor: grab;
    }
}
.image-row-pic {
    @include flex(0 0 120px);
    padding: 2px 5px 2px 0;

    img {
        width: 120px;
        max-height: 120px;
    }
}
.image-row-input {
    @include flexbox();
    @include flex(1 1 auto);
    @include align-items(flex-start);
    padding: 2px 5px 2px 0;

    .input-tip {
        font-size: 12px;
        line-height: 12px;
        padding-top: 5px;
    }
}
</style>
