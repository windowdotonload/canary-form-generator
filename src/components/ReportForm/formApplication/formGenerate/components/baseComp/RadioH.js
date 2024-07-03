import { useCommonMixin, useExtendConfig, generateUniqueUUID, checkFieldItemInPropertyPanel, useState } from "../uitls/index";
import PropertyFields from "../material";
import { GuideTipProperty, GuideNormalTip, GuideLubricationServiceTip } from "../systemComp/GuideTip";

export const RadioH = Vue._$extend(
  {
    mixins: [useCommonMixin()],
    created() {
      this.initDefaultValue();
    },
    data() {
      return {
        formModel: {
          radioValue: "",
        },
      };
    },
    methods: {
      initDefaultValue() {
        if (this.defaultValue) this.formModel.radioValue = this.defaultValue;
      },
      radioInput(e) {
        this.formModel.radioValue = e;
        this.$emit("changeValue", this.formModel.radioValue);
      },
      setRadioHValue(val) {
        this.formModel.radioValue = val;
      },
      getAssignValue() {
        return this.formModel.radioValue;
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
            <el-radio-group disabled={this.disabled} size="mini" value={this.formModel.radioValue} onInput={this.radioInput}>
              {this.radioOptions.map((item, index) => {
                return (
                  <el-radio label={item.value} key={item.value} style="margin-bottom:10px">
                    {(item.label ? item.label : item.value) || `选项${index + 1}`}
                  </el-radio>
                );
              })}
            </el-radio-group>
          </el-form-item>
        </el-form>
      );
    },
  },
  {
    ...useExtendConfig({
      radioOptions: {
        type: Array,
        default: [
          { value: "选项1", key: generateUniqueUUID() },
          { value: "选项2", key: generateUniqueUUID() },
        ],
      },
      defaultValue: { type: String, default: "" },
    }),
  }
);

export const TabBarProperty = Vue.extendWithMixin({
  data() {
    return {
      multiLine: false,
      options: [{ value: "tab1", label: "tab1", key: generateUniqueUUID() }],
    };
  },
  created() {
    const { _configField } = this.activeField;
    if (_configField.children && _configField.children.length) {
      this.options = _configField.children;
    }
  },
  methods: {
    getTabList(e) {
      this.changeFieldConfig("children", e);
    },
  },
  render() {
    return (
      <div>
        <PropertyFields.SelectOptions options={this.options} onGetOptions={this.getTabList} />
      </div>
    );
  },
});
