<template>
  <div class="uploadVideo-container" v-loading="loadingAssets">
    <div class="uploadVideo-preview" v-if="limit == 1">
      <div class="uploadVideo-preview-single" :class="readOnly ? 'video-single-readonly' : ''" v-if="fileList.length == 1 && fileList[0].url">
        <div class="uploadVideo-player-box" :style="{ width, height }">
          <video :src="fileList[0].url" class="uploadVideo-player" :controls="!readOnly && controls" />
          <div class="video-readonly-mask" v-if="readOnly" @click="playReadonlyVideo">
            <img src="@/assets/train_pause.png" alt="" />
          </div>
        </div>
        <i class="el-icon-circle-close close-icon close-icon-hover" @click="deleteVideo" v-if="!readOnly" />
      </div>
    </div>
    <el-upload
      :multiple="multiple"
      v-if="limit == 1 && !readOnly"
      v-show="fileList.length < limit"
      :accept="accept"
      :file-list="fileList"
      ref="uploadVideo"
      action=""
      :limit="limit"
      :http-request="ossUpload"
      :show-file-list="false"
    >
      <template #trigger>
        <div class="el-upload el-upload--picture-card custome-upload-box">
          <i class="el-icon-plus" />
        </div>
      </template>
    </el-upload>
    <el-upload
      :multiple="multiple"
      :disabled="fileList.length == limit && !readOnly"
      v-if="limit > 1"
      :accept="accept"
      :file-list="fileList"
      ref="uploadVideo"
      action=""
      :limit="limit"
      :http-request="ossUpload"
      :show-file-list="false"
    >
      <template #trigger>
        <el-button size="mini" type="danger" :disabled="fileList.length == limit">上传视频</el-button>
      </template>
    </el-upload>
    <UploadFileList v-if="limit > 1" :fileList="fileList" @deleteFileListItem="deleteFileListItem" />

    <el-dialog :visible.sync="readOnlyVideoBox" width="50%" :before-close="handleCloseDialogVideoBox" v-if="readOnly && fileList.length == 1 && fileList[0].url">
      <video ref="dialogVideo" :src="fileList[0].url" class="uploadVideo-player-dialog" controls />
    </el-dialog>
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
      default: ".mp4"
    },
    controls: {
      type: Boolean,
      default: true
    },
    propFileList: {
      type: Array,
      default: []
    },
    width: {
      type: [String, Number]
    },
    height: {
      type: [String, Number]
    },
    limit: {
      type: Number,
      default: 1
    },
    fileType: {
      type: String,
      default: ""
    },
    fileSizeLimit: {
      type: Number,
      default: 300
    },
    multiple: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
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
      this.$emit("changeFileList", this.fileList);
    } finally {
      this.loadingAssets = false;
    }
  },
  data() {
    return {
      loadingAssets: false,
      fileList: [],
      readOnlyVideoBox: false
    };
  },
  methods: {
    playReadonlyVideo() {
      this.readOnlyVideoBox = true;
    },
    handleCloseDialogVideoBox() {
      this.$refs.dialogVideo.pause();
      this.readOnlyVideoBox = false;
    },
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
        const videoElement = document.createElement("video");
        videoElement.src = tempFilePath;
        videoElement.addEventListener("loadedmetadata", async () => {
          const createItem = {
            videoWidth: videoElement.videoWidth,
            videoHeight: videoElement.videoHeight,
            name: file.file.name,
            url: tempFilePath,
            halfPath: "",
            _uid: new Date().getTime(),
            __fileraw: file
          };
          this.fileList.push(createItem);
          const uploadRes = await oss_uploadFile(file.file, file.file.name, this.fileType);
          createItem.halfPath = uploadRes.name;
          this.$emit("changeFileList", this.fileList);
        });
      } catch (e) {
        console.log("ERR", e);
      }
    },
    deleteVideo() {
      this.fileList = [];
      this.$emit("changeFileList", this.fileList);
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
  /deep/ .el-dialog {
    border-radius: 12px;
  }
  /deep/ .el-dialog__body {
    padding: 10px;
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
  width: 380px;
  box-sizing: border-box;
  position: relative;
  cursor: pointer;
  z-index: 9;
  .close-icon {
    font-size: 18px;
    z-index: -1;
    transition: all 0.5s ease;
    right: 60px;
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
  width: 325px;
  height: 150px;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}
.uploadVideo-player {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.close-icon-hover:hover {
  color: #d10000;
}
.video-readonly-mask {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
.video-single-readonly {
  width: fit-content;
  margin-right: 10px;
}
.uploadVideo-player-dialog {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
}
</style>
