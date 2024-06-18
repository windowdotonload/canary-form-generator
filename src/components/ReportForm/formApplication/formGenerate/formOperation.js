import Fields from "./components/material";
import { generateUniqueUUID } from "../formGenerate/components/uitls/index";
import { cloneDeep, get } from "lodash";
import { EVENTBUS } from "../formGenerate/components/uitls/EVENTBUS.js";
import { deleteFormComponent } from "../api/api.js";

export { EVENTBUS };
const { ref, reactive, toRaw } = VueCompositionAPI;

const wrapComponentStyle = {
  fieldItemContainer: {
    position: "relative",
    padding: "0 20px",
    paddingBottom: "8px",
    transition: "all ease 0.5s",
  },
  fieldItemContainerHover: {
    position: "relative",
    padding: "0 20px",
    paddingBottom: "8px",
    cursor: "pointer",
    borderRadius: "6px",
  },
  fieldSubItemContainerHover: {
    position: "relative",
    padding: "0 20px",
    paddingBottom: "8px",
    background: "rgb(209 0 0 / 5%)",
    cursor: "pointer",
    borderRadius: "6px",
  },
  fieldItemContainerActive(parentId = null, componentType) {
    const baseStyle = { position: "absolute", top: "0", left: "-50px", height: "100%", width: "3px", background: "#d10000" };
    if (parentId) {
      baseStyle.left = "-18px";
    }
    if (parentId && componentType === 11) {
      baseStyle.left = "0";
      baseStyle.zIndex = "9";
    }
    return baseStyle;
  },
};

const activeFieldProperty = reactive({ value: null });
const activeFieldHover = ref(null);
const setActiveFieldProperty = (fieldInfo) => {
  activeFieldProperty.value = fieldInfo;
};

export const formOperationState = reactive({
  formContentList: [],
  activeField: null,
  activeFieldProperty,
});

export const changeActiveField = (fieldInfo) => {
  if (formOperationState.activeField && !formOperationState.activeField._configField.fieldName)
    return ELEMENT.Message({
      type: "warning",
      message: "请配置字段名称",
    });
  formOperationState.activeField = fieldInfo;
  setActiveFieldProperty(fieldInfo);
};

export const findComponentForDisplayRule = ([moduleId, fieldId], display = true) => {
  const module = formOperationState.formContentList.find((item) => item.__uuid === moduleId);
  if (!module) return;
  const field = module._uFieldInfo._configField.children.find((item) => item.__uuid === fieldId);
  if (!field) return;
  EVENTBUS.$emit(field.__uuid, { configProperty: "FILLFORMDISPLAY", value: display });
  return field;
};

const createFormField = (fieldInfo, returnOnly) => {
  const __fieldInfo = Object.create(cloneDeep(fieldInfo));
  const backendWoComponentUuid = fieldInfo.configField && fieldInfo.configField.woComponentUuid;
  const curUUUID = backendWoComponentUuid ? backendWoComponentUuid : generateUniqueUUID(10);
  __fieldInfo.__uuid = curUUUID;
  const appendField = createHocComponent(__fieldInfo);
  if (!appendField) return;
  appendField.__uuid = curUUUID;
  if (returnOnly) return appendField;
  formOperationState.formContentList.push(appendField);
};

export const useFormCreate = () => {
  return { formContentList: formOperationState.formContentList, createFormField };
};

export const useActiveFieldProperty = () => {
  return { activeField: activeFieldProperty, setActiveFieldProperty };
};

export const clearFormGenerateData = () => {
  activeFieldProperty.value = null;
  formOperationState.formContentList = [];
  formOperationState.activeField = null;
};

export const checkIsNestLevel = (fieldInfo) => {
  if (fieldInfo._configField.woParentUuid) return true;
  return false;
};

export const PreviewComponent = Vue.extend({
  data() {
    return {
      previewType: "1",
    };
  },
  methods: {
    changePreviewType(value) {
      this.previewType = value;
    },
  },
  render() {
    return (
      <div class="form-preview" style={{ height: "70vh", position: "relative", overflow: "auto", boxSizing: "border-box", paddingRight: "15px" }}>
        <div style={{ width: "100%", height: "39px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <el-radio-group value={this.previewType} fill="#d10000" size="mini" onInput={this.changePreviewType}>
            <el-radio-button label="1">PC端</el-radio-button>
            <el-radio-button label="2">小程序</el-radio-button>
          </el-radio-group>
        </div>
        {this.previewType === "1" ? (
          <div class="form-preview-pc-view-container">
            <div class="form-preview-pc-view-header">表单名称</div>
            <div class="form-preview-pc-view-content">
              {formOperationState.formContentList.map((Field) => (
                <Field key={Field.__uuid} disabledEditForm={true} disabledField={true} ref={Field.__uuid} />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", height: "calc(100% - 40px)", overflow: "hidden", borderRadius: "12px" }}>
            <iframe
              src={
                "https://dev-mobilserv.mobil.com.cn/tool/#/toolkit/wechatformpreview?formContentList=" +
                encodeURIComponent(JSON.stringify(formOperationState.formContentList.map((Field) => toRaw(Field._uFieldInfo))))
              }
              frameborder="0"
              style="width:100%;height:100%"
            ></iframe>
          </div>
        )}
      </div>
    );
  },
});

export const OperationGroup = Vue.extend({
  props: {
    fieldInfo: {
      type: Object,
      default: () => ({}),
    },
    parent: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    moveUp(e) {
      e.stopPropagation();
      if (checkIsNestLevel(this.fieldInfo)) return this.groupModuleChildrenOperation("moveUp", e);
      const index = formOperationState.formContentList.findIndex((item) => item.__uuid === this.fieldInfo.__uuid);
      if (index > 0) {
        const temp = formOperationState.formContentList[index - 1];
        formOperationState.formContentList.splice(index - 1, 1, formOperationState.formContentList[index]);
        formOperationState.formContentList.splice(index, 1, temp);
      }
    },
    moveDown(e) {
      e.stopPropagation();
      if (checkIsNestLevel(this.fieldInfo)) return this.groupModuleChildrenOperation("moveDown", e);
      const index = formOperationState.formContentList.findIndex((item) => item.__uuid === this.fieldInfo.__uuid);
      if (index < formOperationState.formContentList.length - 1) {
        const temp = formOperationState.formContentList[index + 1];
        formOperationState.formContentList.splice(index + 1, 1, formOperationState.formContentList[index]);
        formOperationState.formContentList.splice(index, 1, temp);
      }
    },
    Topping(e) {
      e.stopPropagation();
      if (checkIsNestLevel(this.fieldInfo)) return this.groupModuleChildrenOperation("Topping", e);
      const index = formOperationState.formContentList.findIndex((item) => item.__uuid === this.fieldInfo.__uuid);
      if (index > 0) {
        const temp = formOperationState.formContentList[index];
        formOperationState.formContentList.splice(index, 1);
        formOperationState.formContentList.unshift(temp);
      }
    },
    Bottoming(e) {
      e.stopPropagation();
      if (checkIsNestLevel(this.fieldInfo)) return this.groupModuleChildrenOperation("Bottoming", e);
      const index = formOperationState.formContentList.findIndex((item) => item.__uuid === this.fieldInfo.__uuid);
      if (index < formOperationState.formContentList.length - 1) {
        const temp = formOperationState.formContentList[index];
        formOperationState.formContentList.splice(index, 1);
        formOperationState.formContentList.push(temp);
      }
    },
    async delete(e) {
      e.stopPropagation();
      if (checkIsNestLevel(this.fieldInfo)) return this.groupModuleChildrenOperation("delete", e);
      const woComponentUuid = this.fieldInfo._configField.woComponentUuid;
      if (woComponentUuid) {
        const formData = new FormData();
        formData.append("uuid", woComponentUuid);
        const delteRes = await deleteFormComponent(formData);
        if (delteRes.data.code != 1000) return;
      }
      const index = formOperationState.formContentList.findIndex((item) => item.__uuid === this.fieldInfo.__uuid);
      formOperationState.formContentList.splice(index, 1);
      formOperationState.activeField = null;
      setActiveFieldProperty(null);
    },
    groupModuleChildrenOperation(opType, e) {
      if (this.parent.groupModuleChildrenOperation) {
        this.parent.groupModuleChildrenOperation(opType, this.fieldInfo);
      }
    },
  },
  render() {
    return (
      <div style={{ position: "absolute", right: "20px", top: "1px", zIndex: 99 }}>
        <el-button type="text" size="mini" style={{ color: "#666" }} onClick={this.moveUp}>
          上移
        </el-button>
        <el-button type="text" size="mini" style={{ color: "#666" }} onClick={this.moveDown}>
          下移
        </el-button>
        <el-button type="text" size="mini" style={{ color: "#666" }} onClick={this.Topping}>
          置顶
        </el-button>
        <el-button type="text" size="mini" style={{ color: "#666" }} onClick={this.Bottoming}>
          置底
        </el-button>
        <el-button type="text" size="mini" style={{ color: "#d10000" }} onClick={this.delete}>
          删除
        </el-button>
      </div>
    );
  },
});

export const HocComponentCotr = Vue.extend({
  props: {
    disabledEditForm: {
      type: Boolean,
      default: false,
    },
    disabledField: {
      type: Boolean,
      default: false,
    },
    groupModuleChildrenOperation: {
      type: Function,
      default: () => {},
    },
    _uFieldInfo: {
      type: Object,
      default: null,
    },
  },
  provide() {
    return {
      disabledEditForm: this.disabledEditForm,
    };
  },
  data() {
    return {
      info: null,
      fieldInfo: this._uFieldInfo,
      fieldRules: [],
      fieldItemContainerStyle: cloneDeep(wrapComponentStyle.fieldItemContainer),
      Component: null,
    };
  },
  created() {
    this.initUFieldInfo();
    this.registerEvent();
    this.handleRequiredRule();
  },
  methods: {
    initUFieldInfo() {
      if (!this._uFieldInfo) return;
      this.fieldInfo = this._uFieldInfo;
    },
    getComponentValue() {
      return {
        fieldInfo: this.fieldInfo,
        formModel: this.$refs[this.fieldInfo.__uuid].formModel,
        getAssignValue: this.$refs[this.fieldInfo.__uuid].getAssignValue,
      };
    },
    getFieldComponentInstance() {
      return this.$refs[this.fieldInfo.__uuid];
    },
    handleRequiredRule() {
      if (this.fieldInfo._configField.requireFlag) {
        this.fieldRules = [{ required: true, message: `请输入`, trigger: "blur" }];
      }
    },
    validate() {
      return new Promise((resolve, reject) => {
        this.$refs[this.fieldInfo.__uuid].validate &&
          this.$refs[this.fieldInfo.__uuid].validate((valid) => {
            if (valid) {
              resolve(true);
            } else {
              reject(false);
            }
          });
      });
    },
    registerEvent() {
      EVENTBUS.$on(`${this.fieldInfo.__uuid}`, (configFieldInfo) => this.configField(configFieldInfo));
    },
    mouseEnter(e, curHoverFieldInfo) {
      e.stopPropagation();
      activeFieldHover.value = curHoverFieldInfo.__uuid;
      if (this.disabledEditForm) return;
      this.fieldItemContainerStyle = wrapComponentStyle.fieldItemContainerHover;
    },
    mouseLeave(e) {
      e.stopPropagation();
      if (activeFieldHover.value == this.fieldInfo.__uuid) activeFieldHover.value = null;
      this.fieldItemContainerStyle = wrapComponentStyle.fieldItemContainer;
    },
    generateFieldContainerStyle() {
      return this.disabledEditForm
        ? null
        : activeFieldHover.value && activeFieldHover.value == this.fieldInfo.__uuid
        ? {
            background: activeFieldHover.value ? (activeFieldHover.value == this.fieldInfo.__uuid && checkIsNestLevel(this.fieldInfo) ? "rgb(209 0 0 / 5%)" : "rgba(245,245,245,0.5)") : "",
            ...this.fieldItemContainerStyle,
          }
        : wrapComponentStyle.fieldItemContainer;
    },
    focusField(e) {
      e.stopPropagation();
      const checkFieldNameFill = formOperationState.activeField && !formOperationState.activeField._configField.fieldName;
      if (formOperationState.activeField && !formOperationState.activeField._configField.fieldName)
        return ELEMENT.Message({
          type: "warning",
          message: "请配置字段名称",
        });
      formOperationState.activeField = this.fieldInfo;
      setActiveFieldProperty(this.fieldInfo);
    },
    initFieldInfo(info) {
      // nop
    },
    configField(configFieldInfo) {
      const cloneDeepConfigFieldInfo = cloneDeep(configFieldInfo);
      const { configProperty, value } = cloneDeepConfigFieldInfo;
      if (configProperty === "FILLFORMDISPLAY") {
        const compIns = this.$refs[this.fieldInfo.__uuid];
        if (compIns && compIns.handleFillFormDisplay) {
          compIns.handleFillFormDisplay(value);
        }
        return;
      }
      this.fieldInfo._configField[configProperty] = value;
      const findConfigTarget = (uuid, list) => {
        list.some((item) => {
          const validTarget = item.tabComponentModule ? item.tabComponentModule : item;
          if (uuid === validTarget.__uuid) {
            if (validTarget._uFieldInfo) validTarget._uFieldInfo._configField[configProperty] = value;
            return true;
          }
          const children = validTarget._uFieldInfo && validTarget._uFieldInfo._configField.children;
          if (children && children.length) {
            return findConfigTarget(uuid, validTarget._uFieldInfo._configField.children);
          }
        });
      };
      findConfigTarget(this.fieldInfo.__uuid, formOperationState.formContentList);
      const compIns = this.$refs[this.fieldInfo.__uuid];
      if (compIns && compIns.handleConfig) {
        compIns.handleConfig(cloneDeepConfigFieldInfo);
      }
    },
  },
  render() {
    const Component = Fields[this._uFieldInfo.componentName];
    if (!Component) return null;
    return (
      <div style={this.generateFieldContainerStyle()} onMouseenter={(e) => this.mouseEnter(e, this.fieldInfo)} onMouseleave={this.mouseLeave} onClick={this.focusField}>
        {formOperationState.activeField && this.fieldInfo.__uuid === formOperationState.activeField.__uuid && !this.disabledEditForm && !this.fieldInfo.hideOperationBar ? (
          <OperationGroup fieldInfo={this.fieldInfo} parent={this} />
        ) : null}
        {formOperationState.activeField && this.fieldInfo.__uuid === formOperationState.activeField.__uuid && !this.disabledEditForm ? (
          <div style={wrapComponentStyle.fieldItemContainerActive(checkIsNestLevel(this.fieldInfo), this.fieldInfo._configField.componentType)} />
        ) : null}
        {!this.disabledEditForm && !this.fieldInfo._configField.children ? <div onClick={this.focusField} style={{ position: "absolute", width: "100%", height: "100%", zIndex: "88" }} /> : null}
        <Component
          __CtorUUID={this.fieldInfo.__uuid}
          __configField={this.fieldInfo._configField}
          ref={this.fieldInfo.__uuid}
          disabled={!this.disabledEditForm || this.disabledField}
          disabledEditForm={this.disabledEditForm}
          children={this.fieldInfo._configField.children}
          maxlength={this.fieldInfo._configField.length}
          fieldName={this.fieldInfo._configField.fieldName}
          fieldRules={this.fieldInfo._configField.requireFlag ? [{ required: true, message: `请输入`, trigger: "blur" }] : []}
          defaultValue={this.fieldInfo._configField.defaultValue}
          options={this.fieldInfo._configField.options}
          radioOptions={this.fieldInfo._configField.options}
          checkBoxOptions={this.fieldInfo._configField.options}
          limit={this.fieldInfo._configField.limit}
          textStyle={this.fieldInfo._configField.textStyle}
          textContent={this.fieldInfo._configField.textContent}
          fieldList={this.fieldInfo._configField.fieldList}
          onInitFieldInfo={this.initFieldInfo}
        />
      </div>
    );
  },
});

export const createHocComponent = (fieldInfo) => {
  const _uFieldInfo = Object.create(fieldInfo);
  _uFieldInfo.__uuid = fieldInfo.__uuid;
  _uFieldInfo._configField = { ...fieldInfo.configField };
  return { Cotr: HocComponentCotr, _uFieldInfo };
};
