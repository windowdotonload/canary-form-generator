<template>
  <div>
    <el-upload
      accept="image/*"
      list-type="picture-card"
      class="upload-img-report"
      :class="{ isShowUploadBtn: fileList.length >= limit || notShowUploadBtn }"
      :action="uploadUrl"
      :limit="limit"
      :auto-upload="false"
      :disabled="true"
      :file-list="fileList"
    >
      <div style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center" @click="handlePictureUpload">
        <i class="el-icon-plus"></i>
      </div>
      <div slot="file" slot-scope="{ file }" style="width: 100px; height: 100px">
        <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
        <span class="el-upload-list__item-actions uploadMask">
          <span class="el-upload-list__item-preview">
            <i class="el-icon-zoom-in" @click.self="handlePictureCardPreview(file)"></i>
          </span>
          <span class="el-upload-list__item-preview">
            <i class="el-icon-crop" @click.self="handlePicturePrune(file)"></i>
          </span>
          <span v-if="!disabled" class="el-upload-list__item-delete">
            <i class="el-icon-delete" @click.self="handleRemove(file)"></i>
          </span>
        </span>
      </div>
    </el-upload>
    <!-- 查看图片 -->
    <el-dialog :visible.sync="imgDialogVisible" append-to-body>
      <img width="100%" :src="dialogImageUrl" />
    </el-dialog>
    <!-- 图片裁剪 -->
    <img-cutter
      v-if="cutHeight && cutWidth"
      ref="imgCutterModal"
      label="选择本地图片"
      :crossOrigin="true"
      :isModal="true"
      :crossOriginHeader="anonymous"
      :sizeChange="false"
      toolBgc="none"
      :lockScroll="true"
      :boxWidth="800"
      :boxHeight="450"
      :cutWidth="cutWidth || 200"
      :cutHeight="cutHeight || 200"
      :toolBoxOverflow="false"
      @cutDown="(val) => cutDown(val, item)"
    >
      <div slot="open"></div>
      <div slot="choose"></div>
    </img-cutter>
  </div>
</template>

<script>
import { oss_uploadFile, initAssetsArr } from "../../../../../../generalComponents/OSSUpload/util";
import imgCutter from "@/components/imgCutter.vue";
export default {
  components: { imgCutter },
  props: {
    limit: {
      type: Number,
      default: 3,
    },
    accept: {
      type: String,
      default: ".jpg,.png,.jpeg",
    },
    fileSizeLimit: {
      type: Number,
      default: 10,
    },
    cutWidth: {
      type: Number,
      default: 200,
    },
    cutHeight: {
      type: Number,
      default: 200,
    },
    propFileList: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      pruneIndex: null,
      uploadUrl: "",
      imgDialogVisible: false,
      dialogImageUrl: "",
      cutFlag: false,
      notShowUploadBtn: false,
      tempImagePath: "",
      fileList: [],
    };
  },
  watch: {
    propFileList: {
      handler(val) {
        if (val && val.length) {
          this.fileList = val.map((item) => item);
        }
      },
    },
  },
  methods: {
    initPropFileList() {
      if (this.propFileList && this.propFileList.length) {
        this.fileList = this.propFileList.map((item) => item);
      }
    },
    // 点击上传
    handlePictureUpload() {
      this.cutFlag = false;
      this.$refs.imgCutterModal.handleOpen();
    },
    // 预览
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.imgDialogVisible = true;
    },
    // 删除
    handleRemove(file) {
      const index = this.fileList.findIndex((item) => item.uid === file.uid);
      if (index > -1) {
        this.fileList.splice(index, 1);
      }
      this.$emit("changeFileList", this.fileList);
    },
    // 裁剪
    handlePicturePrune(file) {
      this.cutFlag = true;
      this.fileList.forEach((ele, i) => {
        if (file.uid === ele.uid) {
          this.pruneIndex = i;
        }
      });
      let url = this.fileList[this.pruneIndex].url;
      this.$refs.imgCutterModal.handleOpen({
        name: "img",
        src: url,
        height: 400,
        height: 400,
      });
    },
    // 裁剪确定
    async cutDown(file) {
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
        if (this.cutFlag) {
          this.fileList.splice(this.pruneIndex, 1, createImgItem);
        } else {
          this.fileList.push(createImgItem);
        }
        const uploadRes = await oss_uploadFile(file.file, file.file.name, "work_order_picture");
        createImgItem.halfPath = uploadRes.name;
        this.$emit("changeFileList", this.fileList);
        await this.$nextTick();
        this.cutFlag = false;
        this.pruneIndex = null;
      } catch (e) {
        console.log("ERR", e);
      }
    },
  },
};
</script>
<style lang="less" scoped>
.isShowUploadBtn {
  /deep/ .el-upload--picture-card {
    display: none;
  }
}
.el-upload-list__item-actions {
  height: 100px;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}
.upload-img-report {
  /deep/ .el-upload--picture-card {
    width: 100px;
    height: 100px;
  }

  /deep/ .el-upload-list__item {
    width: 100px;
    height: 100px;
  }
}
</style>
