import { useCommonMixin, useExtendConfig, generateUniqueUUID, checkFieldItemInPropertyPanel, useState } from "../uitls/index";
import PropertyFields from "../material";
import { GuideTipProperty, GuideNormalTip, GuideLubricationServiceTip } from "../systemComp/GuideTip";
import { formOperationState, findComponentForDisplayRule } from "../../formOperation";

export const CheckBoxH = Vue._$extend(
  {
    mixins: [useCommonMixin()],
    created() {
      this.initDefaultValue();
    },
    data() {
      return {
        formModel: {
          value: "",
          checkBoxValue: [],
        },
      };
    },
    methods: {
      async initDefaultValue() {
        if (this.defaultValue) {
          this.formModel.checkBoxValue = Array.isArray(this.defaultValue) ? this.defaultValue : [...this.defaultValue.split(",")].length ? [...this.defaultValue.split(",")] : [];
          this.formModel.value = this.formModel.checkBoxValue.join(",");
        }
        this.handleDisplay();
      },
      checkBoxChange(e) {
        this.formModel.checkBoxValue = e;
        this.formModel.value = e.join(",");
        this.$emit("changeValue", this.formModel.checkBoxValue);
        this.handleDisplay();
      },
      async handleDisplay() {
        await this.$nextTick();
        if (!this.disabledEditForm) return;
        if (!this.__configField.displayRule) return;
        const rule = JSON.parse(this.__configField.displayRule);
        if (rule.displayControl) {
          const displayControl = rule.displayControl.filter((item) => item[0].value && item[1].value.length);
          displayControl.forEach((displayRle) => {
            const [selectInfo, contorlInfo] = displayRle;
            const selectValue = selectInfo.value;
            const contorlFields = contorlInfo.value;
            contorlFields.forEach((contorlFieldValue) => {
              findComponentForDisplayRule(contorlFieldValue, this.formModel.checkBoxValue.includes(selectValue));
            });
          });
        }
      },
      setCheckBoxHValue(val) {
        this.formModel.checkBoxValue = val;
      },
      getAssignValue() {
        return this.formModel.checkBoxValue;
      },
    },
    render() {
      if (!this.display) return null;
      return (
        <el-form model={this.formModel} label-position="top" ref="formRef">
          <el-form-item rules={this.fieldRules} label={this.fieldName}>
            {this.hideFieldName ? null : (
              <span slot="label" style="cursor:pointer">
                {this.hideFieldName ? "" : this.fieldName}
                {this.__configField.tipContent && <GuideNormalTip tipContent={this.__configField.tipContent} />}
                {this.__configField.tipOption && <GuideLubricationServiceTip tipOption={this.__configField.tipOption} />}
              </span>
            )}
            <el-checkbox-group disabled={this.disabled} size="mini" value={this.formModel.checkBoxValue} onInput={this.checkBoxChange}>
              {this.checkBoxOptions.map((item, index) => {
                return (
                  <el-checkbox label={item.value} key={item.value}>
                    {(item.label ? item.label : item.value) || `选项${index + 1}`}
                  </el-checkbox>
                );
              })}
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      );
    },
  },
  {
    ...useExtendConfig({
      checkBoxOptions: {
        type: Array,
        default: [
          { value: "选项1", key: generateUniqueUUID() },
          { value: "选项2", key: generateUniqueUUID() },
        ],
      },
      defaultValue: [{ type: [Array, String], default: [] }],
    }),
  }
);

export const CheckBoxFieldProperty = Vue.extendWithMixin({
  data() {
    return {
      fieldControl: 0,
      disableControl: 0,
      disabledValue: "",
      configOptions: [],
      displayRule: [[{ value: "" }, { value: [] }]],
      contorlListOfFieldList: [],
    };
  },
  watch: {
    "activeField._configField.fieldName": {
      handler() {
        this.handleDisplayOptions();
      },
    },
  },
  created() {
    this.revertDisplayControlProperty();
    this.revertDisableControlProperty();
  },
  mounted() {
    this.handleDisplayOptions();
  },
  methods: {
    async handleDisplayOptions() {
      await this.$nextTick();
      const moduleList = formOperationState.formContentList.filter((item) => item._uFieldInfo._configField.componentType == 11);
      const handleList = moduleList.map((item) => {
        item.value = item._uFieldInfo.__uuid;
        item.label = item._uFieldInfo._configField.fieldName;
        item.children = [];
        item._uFieldInfo._configField.children.forEach((child) => {
          child.value = child._uFieldInfo.__uuid;
          child.label = child._uFieldInfo._configField.fieldName;
          item.children.push(child);
          // 处理Tab
          if (child._uFieldInfo._configField.componentType == 10) {
            const children = child._uFieldInfo._configField.children;
            if (children && children.length) {
              children.forEach((child) => {
                const module = child.tabComponentModule;
                const tabChildrenList = module._uFieldInfo._configField.children;
                if (!tabChildrenList || !tabChildrenList.length) return;
                tabChildrenList.forEach((field) => {
                  field.value = field._uFieldInfo.__uuid;
                  field.label = `${module._uFieldInfo._configField.fieldName}Tab - ` + field._uFieldInfo._configField.fieldName;
                  item.children.push(field);
                });
              });
            }
          }
        });
        return item;
      });
      this.contorlListOfFieldList = handleList;
      return handleList;
    },
    revertDisplayControlProperty() {
      const { _configField } = this.activeField;
      if (!_configField.displayRule) return (this.fieldControl = 0);
      const rule = JSON.parse(_configField.displayRule);
      if (rule.pdfDisplayControl) {
        this.pdfControl = 1;
        this.pdfRule = rule.pdfDisplayControl;
      } else if (rule.displayControl) {
        this.fieldControl = 1;
        this.displayRule = rule.displayControl;
      }
    },
    revertDisableControlProperty() {
      const { _configField } = this.activeField;
      if (!_configField.optionsRule) return (this.disableControl = false);
      this.disableControl = true;
      const rule = _configField.optionsRule;
      const splitArr = rule.split(":");
      this.disabledValue = splitArr[1];
    },
    changeSelectOptFefaultvalue(e) {
      const { options, value } = e;
      this.configOptions = options;
      this.changeFieldConfig("defaultValue", value);
      this.changeFieldConfig("options", options);
    },
    changeShowControl(e, type) {
      if (type == "fieldControl" && !e) {
        this.$refs.fieldControlRef && this.$refs.fieldControlRef.clearInnerControlList();
        const displayRule = this.activeField._configField.displayRule;
        if (!displayRule) return;
        const rule = JSON.parse(displayRule);
        rule.displayControl = "";
        this.changeFieldConfig("displayRule", JSON.stringify(rule));
      } else if (type == "disableControl" && !e) {
        this.$refs.disableControlRef && this.$refs.disableControlRef.clearControlValue("disableControlValue");
        this.changeFieldConfig("optionsRule", "");
      }
      this[type] = e;
    },
    changeControlValue(e) {
      const { controlType, value } = e;
      if (controlType === "disableControl") {
        const optionsRule = `disableValue:${value}`;
        this.changeFieldConfig("optionsRule", optionsRule);
      } else if (controlType === "displayControl" || controlType === "pdfDisplayControl") {
        const displayRule = this.activeField._configField.displayRule;
        let rule = {};
        if (displayRule) {
          rule = JSON.parse(displayRule);
        }
        rule[controlType] = value;
        this.changeFieldConfig("displayRule", JSON.stringify(rule));
      }
    },
  },
  render() {
    return (
      <div>
        <PropertyFields.Input
          defaultValue={this.configField.fieldName}
          fieldRules={[{ required: true, message: "请输入字段名称", trigger: "blur" }]}
          onChangeValue={(e) => this.changeFieldConfig("fieldName", e)}
        />
        <PropertyFields.SwitchH defaultValue={this.configField.requireFlag} fieldName="是否必填" pText="是" nText="否" onChangeValue={(e) => this.changeFieldConfig("requireFlag", e)} />
        <PropertyFields.SelectRelOptForDefault defaultOptions={this.configField.options} defaultSelValue={this.configField.defaultValue} onChangeValue={this.changeSelectOptFefaultvalue} />
        <PropertyFields.SwitchH
          defaultValue={this.disableControl}
          fieldName="是否需要选中某个选项，其他选项无法选中"
          pText="是"
          nText="否"
          onChangeValue={(e) => this.changeShowControl(e, "disableControl")}
        />
        <PropertyFields.DisplayControl
          ref="disableControlRef"
          controlType="disableControl"
          defaultValue={this.disabledValue}
          show={this.disableControl}
          hideFieldName={true}
          options1={this.configOptions}
          onChangeValue={this.changeControlValue}
        />
        <PropertyFields.SwitchH defaultValue={this.fieldControl} fieldName="是否有选项，控制其他字段显影" pText="是" nText="否" onChangeValue={(e) => this.changeShowControl(e, "fieldControl")} />
        <PropertyFields.DisplayControl
          ref="fieldControlRef"
          show={this.fieldControl}
          hideFieldName={true}
          controlList={this.displayRule}
          options1={this.configOptions}
          options2={this.contorlListOfFieldList}
          onChangeValue={this.changeControlValue}
        />
        <GuideTipProperty
          activeField={this.activeField}
          defaultValue={{
            tipType: this.configField.tipType,
            tipContent: this.configField.tipContent,
            tipOption: this.configField.tipOption,
          }}
        />
        <PropertyFields.Input fieldName="Dollar符" maxlength={15} defaultValue={this.configField.documentPlace} onChangeValue={(e) => this.changeFieldConfig("display", e)} />
        <PropertyFields.SwitchH
          defaultValue={this.configField.renderFormat != "none" ? true : false}
          fieldName="是否在报告中展示"
          pText="是"
          nText="否"
          activeValue={true}
          inActiveValue={false}
          onChangeValue={(e) => this.changeFieldConfig("renderFormat", e ? "normal" : "none")}
        />
        <PropertyFields.SwitchH defaultValue={this.configField.display} fieldName="是否默认在页面中展示" pText="是" nText="否" onChangeValue={(e) => this.changeFieldConfig("display", e)} />
      </div>
    );
  },
});
