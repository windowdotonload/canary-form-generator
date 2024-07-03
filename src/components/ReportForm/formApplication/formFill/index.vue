<script>
import { menuData } from "../formGenerate/components/iconMenu/config.js";
import { getFormComponent, addRecordValue, getRecordValue, getRecordPath, getGuideListReq, clearGuideList } from "../api/api.js";
import * as FORM from "../formGenerate/formOperation.js";
import Skeleton from "./components/skeleton";
import { css, cx } from "@emotion/css";
import flattenDeep from "lodash/flattenDeep";
import FillDialog from "./components/fillDialog.vue";
const { ref, reactive, onMounted, onUnmounted } = VueCompositionAPI;

let __vm = null;
export default {
  components: {
    Skeleton,
  },
  data() {
    return {
      renderDone: true,
      componentList: [],
      revertFormValueList: [],
      revertFormValueMapRecord: new Map(),
      moduleList: [],
      activeTab: "",
      finishAllWorkorder: false,
      observer: null,
    };
  },
  provide() {
    return {
      createFormField: this.createFormField,
      formContentList: FORM.formOperationState.formContentList,
      saveForm: this.saveForm,
    };
  },
  async created() {
    this.initVM();
    getGuideListReq();
    await this.getRecordValue();
    await this.revertFormComponentList();
  },

  beforeDestroy() {
    clearGuideList();
  },
  methods: {
    async createIntersectionObserver() {
      await this.$nextTick();
      this.observer = new IntersectionObserver(
        (entries) => {
          const isIntersecting = entries[0].isIntersecting;
          const target = entries[0].target;
          if (isIntersecting) {
            const fieldName = target.getAttribute("data-module-name");
            const woComponentId = this.moduleList.find((item) => item.configField.fieldName == fieldName).configField.woComponentId;
            if (woComponentId) {
              this.activeTab = woComponentId;
            }
          }
        },
        {
          root: this.$refs.formFillContainer,
          rootMargin: "0px",
          threshold: 0.4,
        }
      );

      Object.keys(this.$refs).forEach((key) => {
        if (!this.$refs[key].$el) return;
        this.observer.observe(this.$refs[key].$el);
      });
    },
    initVM() {
      __vm = this;
    },
    async getRecordValue() {
      const res = await getRecordValue({
        woRecordId: this.$route.query.woRecordId,
      });
      if (res.data.code == 1000) {
        this.revertFormValueList = res.data.data;
      }
    },
    findBaseCompInfo(componentType) {
      const baseCompInfo = menuData[0].subMenuData.find((item) => item.componentType === componentType);
      if (baseCompInfo) {
        return JSON.parse(JSON.stringify(baseCompInfo));
      }
      return null;
    },
    handeBackendData(compInfoList) {
      if (!compInfoList) return;
      if (!compInfoList.length) return;
      return compInfoList.map((compInfo) => {
        const configInfo = this.findBaseCompInfo(compInfo.woComponentType);
        const baseCompInfo = configInfo ? configInfo : JSON.parse(JSON.stringify(compInfo));
        baseCompInfo.configField = compInfo;
        baseCompInfo.configField.options = compInfo.options ? JSON.parse(compInfo.options) : baseCompInfo.options;
        baseCompInfo.configField.componentType = compInfo.woComponentType;
        baseCompInfo.configField.fieldName = compInfo.woComponentName;
        baseCompInfo.configField.children = this.handeBackendData(compInfo.children);
        this.revertFormComponentValue(baseCompInfo);
        this.revertFormFillButtonGroupList(baseCompInfo);
        return baseCompInfo;
      });
    },
    async revertFormComponentValue(baseCompInfo) {
      if (!this.revertFormValueList.length) return;
      const findTarget = this.revertFormValueList.find((item) => {
        return item.woComponentId == baseCompInfo.configField.woComponentId;
      });
      if (!findTarget) return;
      let revertValue = findTarget.value;
      if (baseCompInfo.configField.componentType == 2 /** 富文本 */) {
        revertValue = findTarget.richValue;
      }
      baseCompInfo.configField.defaultValue = revertValue || baseCompInfo.configField.defaultValue;
      this.revertFormValueMapRecord.set(baseCompInfo.configField.woComponentId, findTarget);
    },
    revertFormFillButtonGroupList(baseCompInfo) {
      if (baseCompInfo.configField.componentType == 8 /** 组合添加按钮 */) {
        const children = baseCompInfo.configField.children;
        if (!children || !children.length) return;
        const childrenWoComponentIds = children.map((item) => item.configField.woComponentId);
        const findTargetList = this.revertFormValueList.filter((item) => {
          return childrenWoComponentIds.includes(item.woComponentId);
        });
        const __groupList = findTargetList.map((item) => {
          const baseChildInfo = children.find((child) => child.configField.woComponentId == item.woComponentId);
          this.revertFormValueMapRecord.set(item.woComponentId + "-" + item.row, item);
          return {
            ...baseChildInfo,
            configField: {
              ...baseChildInfo.configField,
              defaultValue: item.value,
            },
            row: item.row,
          };
        });
        if (!findTargetList.length) return;
        const groupObj = Object.groupBy(__groupList, (item) => item.row);
        baseCompInfo.configField.__groupList = Object.keys(groupObj).map((key) => groupObj[key]);
      }
    },
    async revertFormComponentList() {
      if (this.$route.query.woFormId) {
        this.renderDone = false;
        const res = await getFormComponent({
          woFormId: this.$route.query.woFormId,
        });
        const woFormCompList = res.data.data;
        const handleWoFormCompList = this.handeBackendData(woFormCompList);
        console.log("this is handleWoFormCompList", handleWoFormCompList);
        if (handleWoFormCompList && handleWoFormCompList.length > 0) {
          handleWoFormCompList.forEach((compInfo) => {
            this.createFormField(compInfo);
          });
        }
        this.moduleList = handleWoFormCompList.filter((item) => {
          return item.componentType == 11 && item.configField.display;
        });
        if (!this.moduleList.length) return;
        this.activeTab = this.moduleList[0].configField.woComponentId;
        this.renderDone = true;
        this.createIntersectionObserver();
      }
    },
    async saveForm(operate /** operate 0-保存草稿，1-保存并发布报告，2-保存并发布工单，3-保存并发布申请单 */, tip = true) {
      const handleRevertWoValueId = (res) => {
        if (!res.woComponentId) return res;
        const woComponentId = res.woComponentId;
        const mapkey = res.row ? woComponentId + "-" + res.row : woComponentId;
        if (this.revertFormValueMapRecord.has(mapkey)) {
          const record = this.revertFormValueMapRecord.get(mapkey);
          res.woValueId = record.woValueId;
        }
        return res;
      };
      const handleSpecialValueKey = (fieldInfo, res) => {
        if (fieldInfo._configField.componentType == 2 /** 富文本 */) {
          res.richValue = res.value;
          delete res.value;
        }
        return res;
      };
      const handleRcordValueFormat = (fieldItem) => {
        const { fieldInfo, formModel } = fieldItem;
        const value = formModel && formModel.value;
        const { row } = fieldInfo;
        const { woComponentId, woComponentName } = fieldInfo._configField;
        const woRecordId = this.$route.query.woRecordId;
        const res = {
          row,
          value,
          woComponentId,
          woComponentName,
          woRecordId,
        };
        handleSpecialValueKey(fieldInfo, res);
        handleRevertWoValueId(res);
        return res;
      };

      const rawValuelist = [];
      FORM.formOperationState.formContentList.map((item) => {
        const componentInstance = this.$refs[item.__uuid];
        const value = componentInstance.getComponentValue();
        rawValuelist.push(value);
        if ([8, 9, 10, 11, 14].includes(componentInstance.fieldInfo._configField.componentType)) {
          const Fied = componentInstance.getFieldComponentInstance();
          const FiedValue = Fied.getComponentValue && Fied.getComponentValue();
          rawValuelist.push(FiedValue);
        }
      });
      const flatFieldArray = flattenDeep(rawValuelist);
      const handleValueList = flatFieldArray
        .filter((field) => field /** 组合添加按钮children存在为空的情况 getComponentValue返回空数组 需过滤 */)
        .map((field) => {
          return handleRcordValueFormat(field);
        });

      const res = await addRecordValue({
        operate,
        woFormValueRequestList: handleValueList,
      });
      if (res.data.code == 1000) {
        if (tip) this.$message.success("保存成功");
        if (operate != 0) this.$router.go(-1);
      }
      this.closeDialog();
    },
    async previewReport() {
      const res = await getRecordPath({
        woRecordId: this.$route.query.woRecordId,
      });
      if (res.data.code == 1000) {
        const fullpath = await await this.requestMethodGetTip("/web/file/getFullUrl", {
          url: res.data.data,
        });
        window.open(fullpath.data.data, "_blank");
      } else {
        this.$message.warning(res.data.msg);
      }
    },
    clickTabpane(e) {
      const activeTabPanelConfigField = this.moduleList[e.index].configField;
      if (!(activeTabPanelConfigField && activeTabPanelConfigField.woComponentUuid)) return;
      const activeTabPanelDOM = this.$refs[activeTabPanelConfigField.woComponentUuid].$el;
      if (!activeTabPanelDOM) return;
      activeTabPanelDOM.scrollIntoView();
    },
    cancelFillForm() {
      this.$confirm("取消后将丢失本次编辑内容", "取消编辑", {
        confirmButtonText: "确定",
        cancelButtonText: "继续编辑",
        type: "warning",
      })
        .then(() => {
          this.$router.go(-1);
        })
        .catch(() => {});
    },
    async saveFormAndPublic() {
      await this.$nextTick();
      this.finishAllWorkorder = true;
    },
    closeDialog() {
      this.finishAllWorkorder = false;
    },
  },
  setup() {
    const { createFormField } = FORM.useFormCreate();

    onUnmounted(() => {
      FORM.clearFormGenerateData();
    });

    return {
      createFormField,
    };
  },
  render() {
    return (
      <div
        class={cx(
          "form-fill__container",
          css`
            position: relative;
            display: flex;
            justify-content: center;
            box-sizing: border-box;
            width: 100%;
            height: 90%;
            margin: 0;
            padding: 0;
          `
        )}
      >
        <el-tabs class="report-form__tabs" value={this.activeTab} tab-position="left" style="margin-right:50px;width:fit-content;min-width:100px" on-tab-click={this.clickTabpane}>
          {this.moduleList.map((item) => {
            return <el-tab-pane label={item.configField.fieldName} name={item.configField.woComponentId} />;
          })}
        </el-tabs>
        <div
          ref="formFillContainer"
          class={css`
            box-sizing: border-box;
            padding: 0 5px;
            width: 50%;
            overflow: auto;
            padding-bottom: 50px;
            &::-webkit-scrollbar {
              width: 3px !important;
            }
          `}
        >
          <div>
            {!this.renderDone ? (
              <Skeleton />
            ) : (
              <transition-group name="form-property-box-content-list">
                {FORM.formOperationState.formContentList.map((Field) => (
                  <Field.Cotr data-module-name={Field._uFieldInfo._configField.fieldName} _uFieldInfo={Field._uFieldInfo} key={Field.__uuid} disabledEditForm={true} ref={Field.__uuid} />
                ))}
              </transition-group>
            )}
          </div>
        </div>
        <div
          class={css`
            z-index: 99;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            position: fixed;
            width: 90%;
            align-items: center;
            height: 50px;
            bottom: 0;
            background-color: #fff;
          `}
        >
          <el-button size="mini" onClick={this.previewReport}>
            预览报告
          </el-button>
          <el-button size="mini" onClick={() => this.saveForm(0)}>
            保存草稿
          </el-button>
          <el-button type="danger" size="mini" onClick={() => this.saveFormAndPublic(1)}>
            保存并发布
          </el-button>
          <el-button size="mini" onClick={this.cancelFillForm}>
            取消
          </el-button>
        </div>

        <FillDialog finishAllWorkorder={this.finishAllWorkorder} />
      </div>
    );
  },
};
</script>

<style>
@import "../formGenerate/index.css";
</style>
<style lang="less" scoped>
.form-fill-container {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 20px;
  padding-top: 0;
}
.form-property-box {
  box-sizing: border-box;
  position: relative;
  transform: translateX(30%);
  width: 50%;
  height: 88%;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  text-decoration: none;
  background-color: rgba(255, 255, 255, 0.5);
  overflow: hidden;
}
.form-bottom-bar {
  position: relative;
  bottom: 0;
  width: 100%;
  height: 39px;
  padding-left: 39%;
  margin-top: 10px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.form-property-right::-webkit-scrollbar {
  display: none;
}
.form-property-box::-webkit-scrollbar {
  display: none;
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
.form-addinfo-other-content {
  height: calc(100% - 100px);
  overflow-y: auto;
}
.form-addinfo-other-content::-webkit-scrollbar {
  display: none;
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
  background: #fff;
  padding: 20px 50px;
  height: calc(100% - 82px);
  overflow-y: auto;
}
.form-property-box-content::-webkit-scrollbar {
  display: none;
}
.form-property-box-content:empty::after {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  content: "请从左侧列表中点击需要添加组件";
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: #999;
}
.form-property-box-content-list-move {
  transition: transform 0.5s;
}
.form-property-right {
  top: 0;
  right: 13%;
  box-sizing: border-box;
  position: absolute;
  width: 20%;
  height: 86%;
  text-decoration: none;
  background-color: rgba(255, 255, 255, 0.5);
  overflow: auto;
}
.form-property-right-header {
  max-height: 100px;
  box-sizing: border-box;
  display: flex;
  flex-wrap: nowrap;
  position: relative;
  align-items: center;
  width: 100%;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 5px 0 rgba(204, 221, 255, 1);
  background: linear-gradient(86deg, rgba(204, 221, 255, 0.4) 0%, rgba(204, 221, 255, 0.1) 100%);
}
.form-addinfo-box {
  margin: 3px;
  margin-top: 15px;
  box-sizing: border-box;
  position: relative;
  padding: 16px;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.form-addinfo-title {
  font-size: 16px;
  font-weight: bolder;
}
.form-addinfo-btn {
  cursor: pointer;
  color: #d10000;
  padding: 5px;
  margin-top: 8px;
  width: 100%;
  align-items: center;
  display: flex;
  box-sizing: border-box;
  justify-content: center;
  border-radius: 3px;
  font-size: 13px;
  border: 1px solid var(--dd-0000, #d00);
  background: var(--dd-00005, rgba(221, 0, 0, 0.05));
}
.form-addinfo-addeditem {
  padding: 12px;
  margin-top: 8px;
  width: 100%;
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  box-sizing: border-box;
  justify-content: center;
  border-radius: 3px;
  font-size: 13px;
  border-radius: 5px;
  background: var(--f-9-f-9-f-9, #f9f9f9);
}
.form-addinfo-header {
  width: 100%;
  font-size: 13px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.delete-icon {
  font-size: 15px;
  cursor: pointer;
}
.delete-icon:hover {
  color: #d10000;
}
.form-addinfo-header-title {
  color: #000;
  font-size: 15px;
  font-weight: bolder;
}
.form-addinfo-content {
  width: 100%;
  margin-top: 10px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-wrap: wrap;
}
.form-addinfo-content-line {
  margin: 3px 0;
  display: flex;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}
.form-addinfo-content-line-key {
  width: 80px;
  margin-right: 10px;
  color: #999;
}
.report-form__tabs {
  /deep/ .el-tabs__item.is-active {
    color: #d10000;
    background-color: #fff;
    border-right: 2px solid #d10000;
  }

  /deep/ .el-tabs__item {
    font-size: 15px;
    line-height: 50px;
    height: 50px;
  }
}
</style>
