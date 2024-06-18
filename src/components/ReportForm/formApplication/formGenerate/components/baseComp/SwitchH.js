import { useCommonMixin, useExtendConfig, checkFieldItemInPropertyPanel, useState } from "../uitls/index";

export const SwitchH = Vue._$extend(
  {
    mixins: [useState(0), useCommonMixin()],
    created() {
      this.initDefaultValue();
    },
    methods: {
      initDefaultValue() {
        this.formModel.value = this.defaultValue;
        this.$emit("changeValue", this.formModel.value);
      },
    },
    render() {
      return (
        <el-form model={this.formModel} label-position="top" ref="formRef">
          <el-form-item label={this.fieldName} rules={this.fieldRules}>
            <el-switch active-value={this.activeValue} inactive-value={this.inActiveValue} disabled={this.disabled} value={this.formModel.value} onChange={this.setInputValue} />
            <span style={{ marginLeft: "10px" }}>{this.formModel.value ? this.pText : this.nText}</span>
          </el-form-item>
        </el-form>
      );
    },
  },
  {
    ...useExtendConfig({
      defaultValue: { type: String, default: "" },
      pText: { type: String, default: "" },
      nText: { type: String, default: "" },
      activeValue: {
        type: Number,
        default: 1,
      },
      inActiveValue: {
        type: Number,
        default: 0,
      },
    }),
  }
);
