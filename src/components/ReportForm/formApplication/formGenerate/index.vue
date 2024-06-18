<template>
  <div class="container">
    <div class="main">
      <FormContent :formContentList="FORM.formOperationState.formContentList" :renderDone="renderDone" />
    </div>
    <div class="left">
      <IconMenu ref="formGenerateIcon" :renderDone="renderDone" />
    </div>
    <div class="right">
      <PropertyPanel :activeField="activeField.value" />
    </div>
  </div>
</template>

<script>
const { ref, reactive, onMounted, provide, watch } = VueCompositionAPI;
import * as FORM from "./formOperation.js";
import { getFormComponent } from "../api/api.js";
import { menuData } from "./components/iconMenu/config.js";
import IconMenu from "./components/iconMenu/index.vue";
import FormContent from "./components/formContent/index.vue";
import PropertyPanel from "./components/propertyPanel/index.vue";
import { cloneDeep } from "lodash";

export default {
  components: {
    IconMenu,
    FormContent,
    PropertyPanel,
  },
  data() {
    return {
      renderDone: true,
    };
  },
  async beforeMount() {
    this.revertFormComponentList();
  },
  methods: {
    findBaseCompInfo(componentType) {
      const baseCompInfo = menuData[0].subMenuData.find((item) => item.componentType === componentType);
      if (baseCompInfo) {
        return cloneDeep(baseCompInfo);
      }
      return null;
    },
    handeBackendData(compInfoList) {
      if (!compInfoList) return;
      if (!compInfoList.length) return;
      return compInfoList.map((compInfo) => {
        const configInfo = this.findBaseCompInfo(compInfo.woComponentType);
        const baseCompInfo = configInfo ? configInfo : cloneDeep(compInfo);
        baseCompInfo.fieldName = compInfo.woComponentName;
        baseCompInfo.configField = compInfo;
        baseCompInfo.configField.options = compInfo.options ? JSON.parse(compInfo.options) : baseCompInfo.options;
        baseCompInfo.configField.componentType = compInfo.woComponentType;
        baseCompInfo.configField.fieldName = compInfo.woComponentName;
        baseCompInfo.configField.children = this.handeBackendData(compInfo.children);
        return baseCompInfo;
      });
    },
    async revertFormComponentList() {
      if (this.$route.query.woFormId) {
        this.renderDone = false;
        const woFormCompList = await this.getFormComponentInfo(this.$route.query.woFormId);
        const handleWoFormCompList = this.handeBackendData(woFormCompList);
        if (handleWoFormCompList && handleWoFormCompList.length > 0) {
          handleWoFormCompList.forEach((compInfo) => {
            this.createFormField(compInfo);
          });
        }
        console.log("this is handleWoFormCompList", handleWoFormCompList);
        this.renderDone = true;
      }
    },
  },
  setup() {
    const { createFormField } = FORM.useFormCreate();
    const { activeField, setActiveFieldProperty } = FORM.useActiveFieldProperty();
    const formGenerateIcon = ref(null);
    provide("createFormField", createFormField);
    provide("formContentList", FORM.formOperationState.formContentList);

    const getfFormContentList = () => FORM.formOperationState.formContentList;

    const getFormComponentInfo = async (woFormId) => {
      if (!woFormId) return;
      const res = await getFormComponent({
        woFormId,
      });
      if (res.data.code === 1000) {
        return res.data.data;
      }
    };

    return {
      FORM,
      formGenerateIcon,
      activeField,
      getFormComponentInfo,
      createFormField,
      setActiveFieldProperty,
      getfFormContentList,
    };
  },
};
</script>

<style>
@import "./index.css";
</style>
<style lang="less" scoped>
/deep/ .el-form-item {
  margin-bottom: 8px;
}
.container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  overflow: auto;
  user-select: none;
}
.left,
.main,
.right {
  position: relative;
  float: left;
  height: 100%;
}
.main {
  box-sizing: border-box;
  padding: 0 var(--side-width);
  width: 100%;
}
.left {
  box-sizing: border-box;
  padding: 0 12px;
  margin-left: -100%;
  width: var(--side-width);
  background: rgba(238, 239, 245, 0.3);
}
.right {
  box-sizing: border-box;
  width: var(--side-width);
  margin-left: calc(var(--side-width) * -1);
  background: rgba(238, 239, 245, 0.3);
}
</style>
