import { useCommonMixin, useExtendConfig, generateUniqueUUID, createDialog, checkFieldItemInPropertyPanel, useState } from "../uitls/index";
import PropertyFields from "../material";
import { GuideTipProperty, GuideNormalTip, GuideLubricationServiceTip } from "../systemComp/GuideTip";
import { css } from "@emotion/css";
const normalStyle = css`
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
`;
export const SelectAbnormalLevel = Vue._$extend(
  {
    mixins: [useCommonMixin()],
    created() {
      this.initDefaultValue();
    },
    data() {
      return {
        formModel: { value: null },
      };
    },
    methods: {
      initDefaultValue() {
        if (Array.isArray(this.defaultValue)) {
          this.defaultValue = this.defaultValue.filter((_) => _);
        }
        this.formModel.value = this.defaultValue || null;
        if (this.multiDefault && typeof this.defaultValue == "string" && this.defaultValue) this.formModel.value = this.defaultValue.split(",").filter((_) => _);
      },
      changeValue(e) {
        this.formModel.value = e;
        this.$emit("changeValue", this.formModel.value);
      },
      setSelectHValue(val) {
        this.formModel.value = val;
      },
    },
    render() {
      if (!this.display) return null;
      return (
        <el-form model={this.formModel} label-position="top" ref="formRef">
          <el-form-item rules={this.fieldRules} label={this.hideFieldName ? "" : this.fieldName} prop="value">
            {this.hideFieldName ? null : (
              <span slot="label" style="cursor:pointer">
                {this.hideFieldName ? "" : this.fieldName}
                {this.__configField.tipContent && <GuideNormalTip tipContent={this.__configField.tipContent} />}
                {this.__configField.tipOption && <GuideLubricationServiceTip tipOption={this.__configField.tipOption} />}
              </span>
            )}
            <el-select
              disabled={this.disabled}
              value={this.formModel.value}
              placeholder="请选择"
              size="mini"
              style={{ width: "100%" }}
              onChange={this.changeValue}
              multiple={this.multiDefault}
              class="select-h"
            >
              {this.options
                .filter((item) => item.value)
                .map((item) => {
                  return <el-option key={item.value} label={item.label || item.value} value={item.value} />;
                })}
            </el-select>
          </el-form-item>
        </el-form>
      );
    },
  },
  {
    ...useExtendConfig({
      options: {
        type: Array,
        default: [
          { value: "正常", key: generateUniqueUUID() },
          { value: "轻微失效", key: generateUniqueUUID() },
          { value: "中等失效", key: generateUniqueUUID() },
          { value: "严重失效", key: generateUniqueUUID() },
        ],
      },
      multiDefault: { type: Boolean, default: false },
      defaultValue: { type: String, default: "" },
    }),
  }
);

export const SelectAbnormalLevelProperty = Vue.extendWithMixin({
  methods: {},
  render() {
    return (
      <div>
        <PropertyFields.Input
          defaultValue={this.configField.fieldName}
          fieldRules={[{ required: true, message: "请输入字段名称", trigger: "blur" }]}
          onChangeValue={(e) => this.changeFieldConfig("fieldName", e)}
        />
        <PropertyFields.SwitchH defaultValue={this.configField.requireFlag} fieldName="是否必填" pText="是" nText="否" onChangeValue={(e) => this.changeFieldConfig("requireFlag", e)} />
        <el-form label-position="top">
          <el-form-item label="选项">
            <el-input size="mini" disabled value="正常" style="margin-bottom:5px"></el-input>
            <el-input size="mini" disabled value="轻微失效" style="margin-bottom:5px"></el-input>
            <el-input size="mini" disabled value="中等失效" style="margin-bottom:5px"></el-input>
            <el-input size="mini" disabled value="严重失效" style="margin-bottom:5px"></el-input>
          </el-form-item>
        </el-form>
        <PropertyFields.SelectH
          defaultValue={this.configField.defaultValue}
          fieldName="默认值"
          options={[
            { value: "正常", key: generateUniqueUUID() },
            { value: "轻微失效", key: generateUniqueUUID() },
            { value: "中等失效", key: generateUniqueUUID() },
            { value: "严重失效", key: generateUniqueUUID() },
          ]}
          onChangeValue={(e) => this.changeFieldConfig("defaultValue", e)}
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
        <div class={normalStyle}>设备异常的优先级，触发说明</div>
        <div class={normalStyle}>1.选中【轻微失效、中等失效】时，触发设备异常的优先级-可暂缓处理。</div>
        <div class={normalStyle}>2.选中【严重失效】时，触发设备异常的优先级-急需处理</div>
      </div>
    );
  },
});
