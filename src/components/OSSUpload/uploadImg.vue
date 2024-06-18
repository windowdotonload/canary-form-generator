<template>
  <div class="uploadImg-contaienr" v-loading="loadingAssets">
    <div class="uploadImg-file-list" v-for="item in fileList" :key="item.url">
      <div class="uploadImg-file-list-item" :style="{ width: `${width}px`, height: `${height}px` }">
        <el-image ref="elImg" style="border-radius: 8px" :style="{ width: `${width}px`, height: `${height}px` }" :src="item.url" :preview-src-list="previewSrcList"> </el-image>
        <div class="uploadImg-file-list-item-mask">
          <i v-if="amplify" class="el-icon-zoom-in img-icon" @click="amplifyImg" />
          <i v-if="downloadable" class="el-icon-download img-icon" @click="downloadImg(item)" style="margin-left: 10px" />
          <i v-if="!readOnly" class="el-icon-delete img-icon" style="margin-left: 20%" @click="deleteItemImg(item)" />
        </div>
      </div>
    </div>
    <el-upload
      v-if="!readOnly"
      :accept="accept"
      :multiple="multiple"
      :file-list="fileList"
      ref="uploadImg"
      action=""
      :limit="limit"
      :http-request="ossUpload"
      :show-file-list="false"
      :disabled="disabled"
    >
      <template #trigger>
        <div class="el-upload el-upload--picture-card custome-upload-box" :style="{ cursor: disabled ? 'not-allowed' : 'pointer' }" v-show="fileList.length < limit">
          <i class="el-icon-plus" />
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script>
import { oss_uploadFile, initAssetsArr } from "./util";
export default {
  model: {
    prop: "propFileList",
    event: "changeFileList",
  },
  props: {
    accept: {
      type: String,
      default: ".jpg,.png,.jpeg",
    },
    propFileList: {
      type: Array,
      default: [],
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    fileType: {
      type: String,
      default: "",
    },
    width: {
      type: [String, Number],
      default: 100,
    },
    height: {
      type: [String, Number],
      default: 100,
    },
    limit: {
      type: Number,
      default: 3,
    },
    fileSizeLimit: {
      type: Number,
      default: 10,
    },
    amplify: {
      type: Boolean,
      default: true,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    downloadable: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    propFileList: {
      handler() {
        this.initPropFileList(false);
      },
    },
  },
  async created() {
    this.initPropFileList();
  },
  beforeDestroy() {
    this.clearAsset();
  },
  data() {
    return {
      loadingAssets: false,
      fileList: [], // interface FILELIST {name:String，url:String, halfPath:String, _uid:String} []
      previewSrcList: [],
    };
  },
  methods: {
    async initPropFileList(emit = true) {
      if (!this.propFileList || this.propFileList.length == 0) return this.clearAsset();
      try {
        this.loadingAssets = true;
        const resArr = await initAssetsArr(this.propFileList);
        this.fileList = resArr;
        this.previewSrcList = this.fileList.map((file) => file.url);
        if (emit) {
          this.$emit("changeFileList", this.fileList);
        }
      } finally {
        this.loadingAssets = false;
      }
    },
    downloadImg(imgItem) {
      let a = document.createElement("a");
      a.href = imgItem.url;
      a.download = imgItem.name;
      a.click();
      setTimeout(() => {
        a = null;
      }, 800);
    },
    async ossUpload(file) {
      const fileType = file.file.name.split(".")[file.file.name.split(".").length - 1].toLowerCase();
      const accepts = this.accept.split(",");
      if (!accepts.some((accept) => accept.includes(fileType))) {
        return this.$message({
          type: "warning",
          message: `请选择 ${this.accept} 格式的文件`,
        });
      }

      const sizeLimit = file.file.size / 1024 / 1024 < this.fileSizeLimit;
      if (!sizeLimit) {
        this.$message({
          type: "error",
          message: `请选择${this.fileSizeLimit}M以内的文件`,
        });
        this.$refs.uploadImg.abort();
        return;
      }
      try {
        const tempFilePath = window.URL.createObjectURL(file.file);
        const createImgItem = { name: file.file.name, url: tempFilePath, halfPath: "", _uid: new Date().getTime(), __fileraw: file };
        this.fileList.push(createImgItem);
        this.previewSrcList = this.fileList.map((item) => item.url);
        const uploadRes = await oss_uploadFile(file.file, file.file.name, this.fileType);
        createImgItem.halfPath = uploadRes.name;
        this.$emit("changeFileList", this.fileList);
      } catch (e) {
        console.log("ERR", e);
      }
    },
    amplifyImg() {
      document.querySelector(".el-image__inner").click();
    },
    deleteItemImg(item) {
      const deleteIndex = this.fileList.findIndex((_) => _._uid == item._uid);
      this.fileList.splice(deleteIndex, 1);
      this.previewSrcList = this.fileList.map((item) => item.url);
      this.$emit("changeFileList", this.fileList);
    },
    clearAsset() {
      this.fileList = [];
      this.previewSrcList = [];
    },
  },
};
</script>

<style lang="less" scoped>
.custome-upload-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
}
.uploadImg-contaienr {
  display: flex;
  flex-wrap: wrap;
  /deep/ .circular {
    width: 26px;
    height: 26px;
  }
}
.uploadImg-file-list-item {
  position: relative;
  margin-right: 10px;
  border-radius: 8px;
  overflow: hidden;
  .img-icon {
    visibility: hidden;
  }
  .uploadImg-file-list-item-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    cursor: pointer;
    transition: all 0.5s ease;
    background: transparent;
    visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
  }
  &:hover .uploadImg-file-list-item-mask {
    background: rgba(0, 0, 0, 0.3);
    visibility: visible;
  }
  &:hover .img-icon {
    visibility: visible;
    color: #fff;
    font-size: 18px;
  }
}
</style>
