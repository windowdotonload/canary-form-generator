<template>
  <div>
    <el-dialog title="提示" class="closeWorkOrder" :visible.sync="finishAllWorkorder" :show-close="true" width="30%" @closed="closeDialog" append-to-body>
      <div style="font-size: 14px; color: #666">当前服务报告完成后，当前工单和服务申请均可完结，是否同步完成？</div>
      <div slot="footer" style="display: flex; justify-content: space-between">
        <el-button plain @click="cancelFinishApply" size="small"> 取消 </el-button>
        <div>
          <el-button type="danger" plain size="small" @click="save(1)"> 发布并完成服务 </el-button>
          <el-button type="danger" plain size="small" @click="save(2)"> 完成工单 </el-button>
          <el-button type="danger" size="small" @click="save(1)"> 仅发布报告 </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    finishAllWorkorder: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    closeDialog() {
      this.$parent.closeDialog();
    },
    cancelFinishApply() {
      this.closeDialog();
    },
    save(type) {
      this.$parent.saveForm(type);
    },
  },
};
</script>

<style scoped></style>
