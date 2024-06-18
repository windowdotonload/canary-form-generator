<template>
  <div class="uploadVideo-container" v-loading="loadingAssets">
    <el-upload
      :multiple="multiple"
      :disabled="fileList.length == limit || disabled"
      :accept="accept"
      :file-list="fileList"
      ref="uploadVideo"
      action=""
      :limit="limit"
      :http-request="ossUpload"
      :show-file-list="false"
    >
      <template #trigger>
        <el-button size="mini" v-if="!useSlot" type="danger" :disabled="fileList.length == limit || disabled">{{ uploadBtnText }}</el-button>
        <slot name="uplaodBtn" v-if="useSlot"> </slot>
      </template>
    </el-upload>
    <UploadFileList :fileList="fileList" @deleteFileListItem="deleteFileListItem" :previewAble="previewAble" />
  </div>
</template>

<script>
import { oss_uploadFile, initAssetsArr } from "./util";
export default {
  components: {
    UploadFileList: () => import("./UploadFileList.vue")
  },
  model: {
    prop: "propFileList",
    event: "changeFileList"
  },
  props: {
    accept: {
      type: String,
      default: ".pdf,.ppt,.pptx"
    },
    propFileList: {
      type: Array,
      default: []
    },
    fileType: {
      type: String,
      default: ""
    },
    uploadBtnText: {
      type: String,
      default: "上传文件"
    },
    limit: {
      type: Number,
      default: 1
    },
    fileSizeLimit: {
      type: Number,
      default: 50
    },
    multiple: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    useSlot: {
      type: Boolean,
      default: false
    },
    previewAble: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  async created() {
    if (!this.propFileList || this.propFileList.length == 0) return;
    try {
      this.loadingAssets = true;
      const resArr = await initAssetsArr(this.propFileList);
      this.fileList = resArr;
      this.previewSrcList = this.fileList.map(file => file.url);
      this.$emit("changeFileList", this.fileList);
    } finally {
      this.loadingAssets = false;
    }
  },
  data() {
    return {
      loadingAssets: false,
      fileList: []
    };
  },
  methods: {
    async ossUpload(file) {
      const fileType = file.file.name.split(".")[file.file.name.split(".").length - 1];
      const accepts = this.accept.split(",");
      if (!accepts.some(accept => accept.includes(fileType))) {
        return this.$message({
          type: "warning",
          message: `请选择 ${this.accept} 格式的文件`
        });
      }

      const sizeLimit = file.file.size / 1024 / 1024 < this.fileSizeLimit;
      if (!sizeLimit) {
        this.$message({
          type: "error",
          message: `请选择${this.fileSizeLimit}M以内的文件`
        });
        this.$refs.uploadImg.abort();
        return;
      }
      try {
        const tempFilePath = window.URL.createObjectURL(file.file);
        const createItem = { name: file.file.name, url: tempFilePath, halfPath: "", _uid: new Date().getTime(), __fileraw: file };
        const uploadRes = await oss_uploadFile(file.file, file.file.name, this.fileType);
        createItem.halfPath = uploadRes.name;
        this.fileList.push(createItem);
        this.$emit("changeFileList", this.fileList);
      } catch (e) {
        console.log("ERR", e);
      }
    },
    deleteVideo() {
      this.fileList = [];
    },
    deleteFileListItem(item) {
      const deleteIndex = this.fileList.findIndex(_ => _._uid == item._uid);
      this.fileList.splice(deleteIndex, 1);
      this.previewSrcList = this.fileList.map(item => item.url);
      this.$emit("changeFileList", this.fileList);
    }
  }
};
</script>

<style lang="less" scoped>
.uploadVideo-container {
  /deep/ .circular {
    width: 26px;
    height: 26px;
  }
}
.custome-upload-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
}
.uploadVideo-preview-single {
  width: 330px;
  box-sizing: border-box;
  position: relative;
  cursor: pointer;
  z-index: 9;
  .close-icon {
    font-size: 18px;
    z-index: -1;
    transition: all 0.5s ease;
    right: 55px;
    top: 0;
    position: absolute;
    visibility: hidden;
  }
  &:hover .close-icon {
    right: 30px;
    visibility: visible;
  }
}

.uploadVideo-player-box {
  position: relative;
  width: 280px;
  height: 150px;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}
.uploadVideo-player {
  width: 100%;
  object-fit: contain;
}
</style>
