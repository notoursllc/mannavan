<script>
import Vue from 'vue';
import { Tooltip } from 'element-ui';
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
        FileButton: () => import('@/components/admin/FileButton')
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
            // var files = e.target.files || e.dataTransfer.files;

            if (!files.length) {
                return;
            }

            console.log("FILES", files)

            if(!this.filesAreAcceptedTypes(files)) {
                throw new Error('File type not allowed')
            }

            // this.createTempImage(files[0]);
            this.createTempImages(files);
        },


        createTempImages(files) {
            let numFiles = files.length <= this.numRemainingUploads ? files.length : this.numRemainingUploads;
            console.log('numFiles', numFiles)

            for(let i=0; i<numFiles; i++) {
                let reader = new FileReader();

                reader.onload = (e) => {
                    this.fileList.push({
                        url: e.target.result,
                        altText: null,
                        raw: files[i]
                    })
                };
                reader.readAsDataURL(files[i]);
            }
        },


        deleteTempImage(index) {
            this.fileList.splice(index, 1);
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

        <div class="image-row" v-for="(obj, index) in fileList" :key="index">
            <div class="image-row-pic">
                <img
                    class="cursorPointer"
                    :src="obj.url"
                    alt=""
                    @click="onPreview(obj.url)" />
            </div>

            <div class="image-row-input">
                <div>
                    <el-input
                        v-model="obj.altText"
                        class="widthAll"
                        placeholder="Image alt text" />
                    <div class="input-tip">Write a brief description of this image to improve search engine optimization (SEO) and accessibility for visually impaired customers.</div>
                </div>

                <el-button
                    @click="deleteTempImage(index)"
                    class="mlm"
                    type="text">Delete</el-button>
            </div>
        </div>

        <div class="mtm">
            <file-button
                :accept="accept"
                :multiple="true"
                :disabled="numRemainingUploads < 1"
                @change="onFileChange">Select File</file-button>
            <!-- <input
                type="file"
                multiple="multiple"
                ref="file"
                :accept="accept"
                @change="onFileChange"
                :disabled="numRemainingUploads < 1" />  {{ numRemainingUploads }} -->
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

.image-row {
    @include flexbox();
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
