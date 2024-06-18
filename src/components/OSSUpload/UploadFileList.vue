<template>
  <div class="file-list-container">
    <div class="file-list-item" v-for="item in fileList" :key="item._uid">
      <span>
        <i class="el-icon-document" style="margin-right:8px" />
        {{ item.name }}
      </span>
      <span>
        <i class="el-icon-view" style="margin-right:10px" @click="previewItem(item)" v-if="previewAble" />
        <i class="el-icon-circle-close" @click="deleteFileListItem" />
      </span>
    </div>
  </div>
</template>

<script>
import { getFullPath } from "./util";
export default {
  props: {
    fileList: {
      type: Array,
      default: []
    },
    previewAble: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    deleteFileListItem(item) {
      this.$emit("deleteFileListItem", item);
    },
    async previewItem(item) {
      const res = await getFullPath(item.halfPath);
      window.open(res.data.data, "_blank");
    }
  }
};
</script>

<style lang="less" scoped>
.file-list-container {
  margin-top: 10px;
}
.file-list-item {
  font-size: 15px;
  height: 23px;
  box-sizing: border-box;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(242, 242, 242, 0.3);
  padding: 8px;
  border-radius: 3px;
  transition: all 0.5s ease;
  cursor: pointer;
  &:hover {
    background: #f2f2f2;
    .el-icon-circle-close,
    .el-icon-view {
      &:hover {
        color: #d10000;
      }
      visibility: visible;
    }
  }
  .el-icon-circle-close,
  .el-icon-view {
    visibility: hidden;
  }
}
</style>
