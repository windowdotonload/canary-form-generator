<template>
  <div class="form-create-container" :style="{ height: containerHeight }">
    <div class="form-crate-header">
      <div></div>
      <div style="margin-left: 6%">
        <el-radio-group v-model="formActivePanel" size="mini" fill="#fff" border text-color="#d10000">
          <el-radio-button :label="1" :style="getActiveStyle(1)">表单属性管理</el-radio-button>
          <el-radio-button :label="2" :style="getActiveStyle(2)">表单编辑器</el-radio-button>
        </el-radio-group>
      </div>
      <div>
        <el-button type="danger" size="mini" @click="save">保存</el-button>
        <el-button type="danger" plain size="mini" @click="prevForm">预览</el-button>
        <el-button size="mini" @click="cancelCreate">取消</el-button>
      </div>
    </div>
    <div class="form-crate-content">
      <FormProperty v-show="formActivePanel == 1" ref="FormProperty" />
      <FormGenerate v-show="formActivePanel == 2" ref="FormGenerate" />
    </div>
  </div>
</template>

<script>
const { ref, reactive, onMounted, onUnmounted, provide } = VueCompositionAPI;
import { addForm, addFormComponent, updateForm } from "../api/api";
import { generateUniqueUUID } from "../formGenerate/components/uitls/index.js";
import { createDialog } from "../formGenerate/components/uitls/index.js";
import FormProperty from "./formProperty.vue";
import FormGenerate from "../formGenerate/index";
import { PreviewComponent, clearFormGenerateData, formOperationState } from "../formGenerate/formOperation.js";
import { cloneDeep } from "lodash";

export default {
  components: {
    FormProperty,
    FormGenerate,
  },
  data() {
    return {
      woFormId: "",
    };
  },
  created() {
    this.initWoFormId();
  },
  methods: {
    initWoFormId() {
      if (this.$route.query.woFormId) {
        this.woFormId = this.$route.query.woFormId.toString();
        this.$nextTick(() => {
          this.changePanel(2);
        });
      }
    },
    changePanel(type) {
      if (type) this.formActivePanel = type;
    },
    cancelCreate() {
      this.$confirm("请确认是否保存本次编辑内容，取消后将无法找回当前编辑内容", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // this.$router.replace({ name: "formTemplateList" });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    prevForm() {
      createDialog({
        title: "预览",
        width: "50%",
        ContentComponent: PreviewComponent,
      });
    },
    async saveForm() {
      const formPropertyParams = this.$refs.FormProperty.getFormMOdel();
      if (!formPropertyParams) return;
      const params = {
        ...formPropertyParams,
      };
      let saveRes;
      if (this.$route.query.woFormId) {
        params.woFormId = this.$route.query.woFormId;
        saveRes = await updateForm(params);
      } else {
        saveRes = await addForm(params);
      }

      if (this.$route.query.woFormId) {
        if (!this.woFormId) this.$route.query.woFormId;
      } else if (saveRes && saveRes.data.code == 1000) {
        const woFormId = saveRes.data.data;
        this.woFormId = woFormId;
      }
    },
    async addFormComponent() {
      if (!this.woFormId) return;
      const handleComponentItemInfo = (componentItemInfo) => {
        let compItemParams = {};
        if (componentItemInfo._uFieldInfo && componentItemInfo._uFieldInfo._configField) {
          compItemParams = cloneDeep(componentItemInfo._uFieldInfo._configField);
        } else {
          compItemParams = cloneDeep(componentItemInfo);
        }

        if (compItemParams.options) {
          compItemParams.options = JSON.stringify(compItemParams.options);
        }
        if (compItemParams.children && compItemParams.children.length) {
          compItemParams.children = compItemParams.children.map((child) => {
            return handleComponentItemInfo(compItemParams.componentType == 10 ? child.tabComponentModule : child);
          });
        }
        Object.entries(compItemParams).forEach(([key, value]) => {
          if (key.indexOf("__") == 0) delete compItemParams[key];
        });
        return {
          ...compItemParams,
          woFormId: this.woFormId,
          woComponentType: compItemParams.componentType,
          woComponentName: compItemParams.fieldName,
          woComponentUuid: componentItemInfo.__uuid,
        };
      };
      const formContentList = formOperationState.formContentList;

      const componentListParams = formContentList.map((item) => {
        return handleComponentItemInfo(item);
      });

      console.log("componentListParams", componentListParams);
      const res = await addFormComponent(componentListParams);
      if (res && res.data.code == 1000) {
        return res.data.data;
      }
    },
    async save() {
      this.saveFormExec();
    },
    async saveFormExec() {
      await this.saveForm();
      await this.addFormComponent();
      this.refreshFormGenerate();
    },
    async refreshFormGenerate() {
      clearFormGenerateData();
      await this.$nextTick();
      this.$refs.FormGenerate.revertFormComponentList();
    },
  },
  setup() {
    const containerHeight = ref("92%");
    const formActivePanel = ref(1);
    const leftBtnActiveStyle = "border: 1px solid #d10000;border-top-left-radius: 4px;border-bottom-left-radius: 4px;box-sizing: border-box;";
    const rightBtnActiveStyle = "border: 1px solid #d10000;border-top-right-radius: 4px;border-bottom-right-radius: 4px;padding-left:1px;box-sizing: border-box;";

    const getActiveStyle = (btnType) => {
      if (btnType == 1) return formActivePanel.value == 1 ? leftBtnActiveStyle : "";
      if (btnType == 2) return formActivePanel.value == 2 ? rightBtnActiveStyle : "";
    };
    onUnmounted(() => {
      clearFormGenerateData();
    });

    return {
      containerHeight,
      formActivePanel,
      getActiveStyle,
    };
  },
};
</script>

<style lang="less" scoped>
/deep/ .el-radio-button__inner:hover {
  color: #001450;
}
.form-create-container {
  position: relative;
  box-sizing: border-box;
  padding: 0 20px;
  width: 100%;
  min-width: 1236px;
  background: rgba(238, 239, 245, 0.3);
  border-radius: 5px;
  overflow: hidden;
  overflow-y: auto;
}
.form-create-container::-webkit-scrollbar {
  display: none;
}
.form-crate-header {
  width: 100%;
  box-sizing: border-box;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(238, 239, 245, 0.3);
}
.form-crate-content {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  height: calc(100% - 50px);
}
</style>
