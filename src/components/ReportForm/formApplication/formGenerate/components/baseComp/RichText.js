import { useCommonMixin, useExtendConfig, checkFieldItemInPropertyPanel, useState } from "../uitls/index";
import Editor from "./Editor.vue";
import PropertyFields from "../material";
import { GuideTipProperty, GuideNormalTip, GuideLubricationServiceTip } from "../systemComp/GuideTip";

export const RichText = Vue._$extend(
  {
    name: "RichText",
    mixins: [useState(this.defaultValue), useCommonMixin()],
    created() {
      this.initDefaultValue();
    },
    data() {
      return {
        editor: null,
        html: "<p>hello</p>",
        toolbarConfig: {},
        editorConfig: { placeholder: "请输入内容..." },
        mode: "default", // or 'simple'
      };
    },
    methods: {
      initDefaultValue() {
        this.formModel.value = this.defaultValue;
      },
      resetInputValue(val = "") {
        this.formModel.value = val;
      },
      changeValue(richTextValue) {
        this.formModel.value = richTextValue;
      },
    },
    render() {
      if (!this.display) return null;
      return (
        <el-form model={this.formModel} label-position="top" ref="formRef">
          <el-form-item label={this.hideFieldName ? "" : this.fieldName} rules={this.fieldRules} prop="value" style={{ marginBottom: this.marginBottom }}>
            {this.hideFieldName ? null : (
              <span slot="label" style="cursor:pointer">
                {this.hideFieldName ? "" : this.fieldName}
                {this.__configField.tipContent && <GuideNormalTip tipContent={this.__configField.tipContent} />}
                {this.__configField.tipOption && <GuideLubricationServiceTip tipOption={this.__configField.tipOption} />}
              </span>
            )}
            <Editor key={this.placeholder} placeholder={this.placeholder} onChangeValue={this.changeValue} defaultValue={this.defaultValue} maxLength={this.maxlength} />
          </el-form-item>
        </el-form>
      );
    },
  },
  { ...useExtendConfig({ defaultValue: { type: String, default: "" }, multiLine: { type: Boolean, default: false } }) }
);

export const RichTextFieldProperty = Vue.extendWithMixin({
  methods: {
    changeLen(e) {
      this.changeFieldConfig("lengthMax", e > 500 ? 500 : e);
      if (e > 500) {
        this.$refs.intpuLenProto.resetInputValue(500);
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
        <PropertyFields.Input ref="intpuLenProto" defaultValue={this.configField.lengthMax} fieldName="输入字数上限" onChangeValue={(e) => this.changeLen(e)} />
        <PropertyFields.Input defaultValue={this.configField.placeHolder} fieldName="文字提示" onChangeValue={(e) => this.changeFieldConfig("placeHolder", e)} />
        <GuideTipProperty
          activeField={this.activeField}
          defaultValue={{
            tipType: this.configField.tipType,
            tipContent: this.configField.tipContent,
            tipOption: this.configField.tipOption,
          }}
        />
        <PropertyFields.Input fieldName="Dollar符" maxlength={15} defaultValue={this.configField.documentPlace} onChangeValue={(e) => this.changeFieldConfig("documentPlace", e)} />
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
