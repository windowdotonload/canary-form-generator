<template>
  <el-form ref="baseInfoForm" :model="form" class="form-property-container" label-position="top">
    <div class="form-property-box">
      <div class="form-property-box-header">基本信息</div>
      <div class="form-property-box-content">
        <el-form-item label="报告类型" size="mini" prop="formName" :rules="[{ required: true, message: '请选择报告类型', trigger: 'blur' }]">
          <el-select :disabled="woFormTypeDisabled" v-model="form.woFormType" placeholder="请选择报告类型" style="width: 100%">
            <el-option v-for="item in reportFormTypeList" :key="item.code" :label="item.name" :value="item.code"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" size="mini">
          <el-input v-model="form.remark" maxlength="30" placeholder="请输入报告描述" />
        </el-form-item>
        <el-form-item label="状态" size="mini" prop="status" :rules="[{ required: true, message: '请输入表单名称', trigger: 'blur' }]">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
    </div>
  </el-form>
</template>

<script>
import { getWoFormType, addForm } from "../api/api.js";
export default {
  inject: ["editFormData"],
  created() {
    this.getWoFormType();
  },
  data() {
    return {
      managerUserOptions: [],
      managerUserOptionsFromUserList: [],
      workShopList: [],
      woFormTypeDisabled: false,
      form: {
        woFormType: this.$route.query.woFormType || "",
        remark: this.$route.query.remark || "",
        status: this.$route.query.status || 1,
      },
      reportFormTypeList: [],
    };
  },
  methods: {
    async getWoFormType() {
      this.initWoFormTypeDisabled();
      const params = {
        current: 1,
        size: 30,
      };
      const res = await getWoFormType(params);
      if (res.data.code == 1000) {
        this.reportFormTypeList = res.data.data.list;
      }
      this.initWoFormType();
    },
    initWoFormTypeDisabled() {
      if (this.$route.query.woFormType) {
        this.woFormTypeDisabled = true;
      }
    },
    initWoFormType() {
      if (this.$route.query.woFormType) {
        this.form.woFormType = this.$route.query.woFormType;
      }
    },
    getFormMOdel() {
      if (!this.form.woFormType) {
        this.$message.warning("请选择报告类型");
        return null;
      }
      return this.form;
    },
  },
};
</script>

<style lang="less" scoped>
.form-property-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  box-sizing: border-box;
  padding-bottom: 20px;
}
.form-property-box {
  width: 60%;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  text-decoration: none;
  background-color: rgba(255, 255, 255, 0.5);
  margin-top: 20px;
  overflow: hidden;
}
.form-property-box-header {
  background-color: #f9f9f9;
  padding: 0 20px;
  height: 39px;
  display: flex;
  align-items: center;
  color: #000;
  font-size: 15px;
  font-weight: bolder;
}
.form-property-box-header::before {
  content: "";
  display: inline-block;
  width: 5px;
  height: 20px;
  margin-right: 10px;
  background-color: rgb(209, 0, 0, 0.8);
}
.form-property-box-content {
  padding: 20px;
}
.form-create-tip {
  margin-top: -1%;
  font-size: 12px;
  color: #d10000;
}
</style>
