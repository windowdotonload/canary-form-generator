import { resetOilCascadeMenu } from "@/components/formApplication/api/index.js";
import { EVENTBUS } from "./EVENTBUS.js";
import { cloneDeep } from "lodash";

export const checkFieldItemInPropertyPanel = (vm) => {
  if (vm.$parent.$options._COMPONENTTYPE && vm.$parent.$options._COMPONENTTYPE === "PROPERTY" && vm.$parent.activeField) return true;
  return false;
};

export const revertFieldItemEditValue = (vm, revertFieldKey, reverValueKey, directAssign = false) => {
  if (checkFieldItemInPropertyPanel(vm) && vm.$parent.activeField._configField[reverValueKey] != undefined) {
    if (directAssign) return (vm[revertFieldKey] = vm.$parent.activeField._configField[reverValueKey]);
    vm.formModel[revertFieldKey] = vm.$parent.activeField._configField[reverValueKey];
  }
};

export const useCommonMixin = () => {
  return {
    data() {
      return {
        display: true,
      };
    },
    created() {
      /** formPoeration > initFieldInfo */
      this.$emit("initFieldInfo", this);
      this.initDefaultDisplay();
    },
    methods: {
      initDefaultDisplay() {
        if (!this.disabledEditForm) return (this.display = true);
        if (!this.__configField) return;
        this.display = this.__configField.display;
      },
      handleFillFormDisplay(e) {
        this.display = e;
      },
      validate() {
        return new Promise((res) => {
          if (!this.$refs["formRef"]) return res(true);
          this.$refs["formRef"].validate((valid) => {
            res(valid);
          });
        });
      },
      getAssignValue() {
        return this.formModel.value;
      },
    },
  };
};

export const useExtendConfig = (config = {}) => {
  return {
    props: {
      __CtorUUID: {
        type: String,
        default: "",
      },
      __configField: {
        type: Object,
        default: () => ({}),
      },
      parentUid: {
        type: Number,
        default: "",
      },
      hideFieldName: {
        type: Boolean,
        default: false,
      },
      fieldName: {
        type: String,
        default: "字段名称",
      },
      fieldRules: {
        type: Array,
        default: [],
      },
      placeholder: {
        type: String,
        default: "请输入",
      },
      maxlength: {
        type: Number,
        default: 15,
      },
      reverPropertyPanelValueKey: {
        type: String,
        default: "",
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      marginBottom: {
        type: String,
        default: "",
      },
      disabledEditForm: {
        type: Boolean,
        default: false,
      },
      ...config,
    },
  };
};

export const useState = (val = "") => {
  return {
    data() {
      return {
        formModel: {
          value: val,
        },
      };
    },
    methods: {
      setInputValue(e) {
        this.formModel.value = e;
        this.$emit("setVal", this.formModel.value);
        this.$emit("changeValue", this.formModel.value);
      },
    },
  };
};

export const configMixin = (rawOptions) => {
  return {
    data() {
      return {
        configField: {},
      };
    },
    beforeMount() {
      this.revertPropertyPanel();
    },
    methods: {
      changeFieldConfig(configProperty, value) {
        EVENTBUS.$emit(`${this.activeField.__uuid}`, { configProperty, value });
      },
      revertPropertyPanel() {
        const { _configField } = this.activeField;
        this.configField = cloneDeep(_configField);
      },
      changeTipInfo(e) {
        const { type, value } = e;
        if (type === "needTip") {
          if (!value) {
            this.changeFieldConfig("tipType", "");
            this.changeFieldConfig("tipContent", "");
            this.changeFieldConfig("tipOption", "");
          } else {
            this.changeFieldConfig("tipType", 1);
          }
        } else {
          this.changeFieldConfig(type, value);
        }
      },
    },
  };
};

const generateUUID = () => {
  let d = new Date().getTime();
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    d += performance.now();
  }
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

  return uuid;
};

const usedUUIDs = new Set();

export const generateUniqueUUID = (len) => {
  let uuid;
  do {
    uuid = generateUUID();
    if (len) uuid = uuid.slice(0, len);
  } while (usedUUIDs.has(uuid));
  usedUUIDs.add(uuid);
  return uuid;
};

export const createDialog = (props = {}) => {
  let DIALOG, DIALOGINSTANCE, EL;
  DIALOG = Vue.extend({
    provide() {
      return {
        ...props.componentProps,
      };
    },
    created() {
      this.title = props.title ? props.title : this.title;
      this.width = props.width ? props.width : this.width;
      this.ContentComponent = props.ContentComponent;
    },
    data() {
      return {
        title: "",
        width: "30%",
        ContentComponent: null,
        dialogBoxVis: true,
      };
    },
    methods: {
      closeDialog() {
        this.dialogBoxVis = false;
        Vue.nextTick(() => {
          if (document.body.contains(EL)) document.body.removeChild(EL);
          DIALOG = null;
          DIALOGINSTANCE = null;
          this.$destroy();
        });
      },
      addOilSuccess() {
        ELEMENT.Message({
          message: "添加油品成功",
          type: "success",
        });
        resetOilCascadeMenu();
        this.closeDialog();
      },
    },
    render() {
      const ContentComponent = this.ContentComponent || null;
      return (
        <el-dialog
          class={props.noStyle ? "form-generator-dialog-normal" : "form-generator-dialog"}
          width={this.width}
          visible={this.dialogBoxVis}
          close-on-click-modal={false}
          v-if={this.dialogBoxVis}
          show-close={false}
          destroy-on-close={true}
          onClose={this.closeDialog}
        >
          <div style={{ width: "100%", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", height: "30px", width: "100%", alignItems: "center" }}>
              <span style={{ fontWeight: "bold", fontSize: "16px" }}>{this.title || "提示"}</span>
              <i class="el-icon-close" style={{ fontSize: "15px", cursor: "pointer" }} onClick={this.closeDialog} />
            </div>
            <div style={{ boxSizing: "border-box", width: "100%", paddingTop: "15px" }}>
              <ContentComponent onAddOilSuccess={this.addOilSuccess} />
            </div>
          </div>
        </el-dialog>
      );
    },
  });
  DIALOGINSTANCE = new DIALOG();
  EL = DIALOGINSTANCE.$mount().$el;
  document.body.appendChild(EL);
  return DIALOGINSTANCE;
};

Vue._$extend = function (extendOptions, mergeOptions = {}) {
  const options = Object.assign({}, extendOptions, mergeOptions);
  return Vue.extend(options);
};
Vue.extendWithMixin = (rawOptions) => {
  const extendOptions = {
    _COMPONENTTYPE: "PROPERTY",
    mixins: [configMixin(rawOptions)],
    props: {
      activeField: {
        type: Object,
        default: () => ({}),
      },
    },
  };
  const options = Object.assign({}, extendOptions, rawOptions);
  return Vue.extend(options);
};
