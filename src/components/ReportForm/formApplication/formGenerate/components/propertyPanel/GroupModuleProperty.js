import PropertyFields from "../material";
import { EVENTBUS } from "../../formOperation.js";
import { menuData } from "../iconMenu/config.js";
import { cloneDeep } from "lodash";
import { generateUniqueUUID } from "../uitls/index.js";
export const configMixin = (rawOptions) => {
  return {
    methods: {
      changeFieldConfig(configProperty, value) {
        EVENTBUS.$emit(`${this.activeField.__uuid}`, { configProperty, value });
      },
    },
  };
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
const GroupModulePropertyOptionsList = menuData[0].subMenuData.map((item) => {
  return {
    value: item.componentType,
    label: item.fieldName,
  };
});

export const GroupModuleProperty = Vue.extendWithMixin({
  data() {
    return {
      multiLine: false,
      options: [{ value: "", key: generateUniqueUUID() }],
    };
  },
  created() {
    console.log("--activeField--GroupModulePropery", cloneDeep(this.activeField));
    const { _configField } = this.activeField;
    if (_configField.children && _configField.children.length) {
      this.options = cloneDeep(_configField.children);
    }
  },
  methods: {
    changeTextStyle(e) {
      if (e == 1) this.multiLine = false;
      else if (e == 2) this.multiLine = true;
      this.$refs.textContent.resetInputValue("文字");
      this.changeFieldConfig("textStyle", e);
      this.changeFieldConfig("textContent", "文字");
    },
    getComList(e) {
      console.log("eee", e);
      this.changeFieldConfig("children", cloneDeep(e.selectOptions));
    },
  },
  render() {
    return (
      <div>
        <PropertyFields.Input
          fieldName="模块名称"
          maxlength={15}
          defaultValue="模块名称"
          fieldRules={[{ required: true, message: "请输入字段名称", trigger: "blur" }]}
          onChangeValue={(e) => this.changeFieldConfig("textContent", e)}
          reverPropertyPanelValueKey=""
        />
        <PropertyFields.RadioH
          fieldName="PDF展示方式"
          defaultValue="1"
          radioOptions={[
            { value: "1", label: "按顺序平铺" },
            { value: "2", label: "表格左右分布" },
          ]}
          onChangeValue={(e) => this.changeFieldConfig("limit", e)}
          reverPropertyPanelValueKey="limit"
        />
        <PropertyFields.Input fieldName="Dollar符" maxlength={15} defaultValue="模块名称" onChangeValue={(e) => this.changeFieldConfig("textContent", e)} reverPropertyPanelValueKey="" />
        <PropertyFields.SelectOptions fieldName="模块子字段" optionsType={2} options={this.options} optionsList={GroupModulePropertyOptionsList} onGetOptions={this.getComList} />
      </div>
    );
  },
});
