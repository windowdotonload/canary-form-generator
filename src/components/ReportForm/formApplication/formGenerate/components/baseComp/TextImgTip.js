import { useCommonMixin, useExtendConfig, checkFieldItemInPropertyPanel, useState } from "../uitls/index";
import { UploadImg } from "./UploadImg";
import PropertyFields from "../material";
import { css } from "@emotion/css";
import { GuideTipProperty, GuideNormalTip, GuideLubricationServiceTip } from "../systemComp/GuideTip";
import { EVENTBUS } from "../../formOperation.js";

export const TextImgTip = Vue._$extend(
  {
    mixins: [useCommonMixin()],
    data() {
      return {
        imgUrl: "",
        formModel: {
          value: "",
        },
      };
    },
    created() {
      this.initDefaultValue();
    },
    methods: {
      async initDefaultValue() {
        if (this.defaultValue) {
          this.imgUrl = [this.defaultValue];
        }
      },
      handleConfig(e) {
        if (e.configProperty == "__img") {
          let res = null;
          if (e.value.length > 0) {
            this.$refs.textTipUploadImg.setFile([e.value[0].url]);
            this.imgUrl = [e.value[0].url];
            res = e.value[0].halfPath;
          } else {
            this.$refs.textTipUploadImg.clearFile();
            this.imgUrl = "";
            res = "";
          }
          EVENTBUS.$emit(this.__CtorUUID, { configProperty: "defaultValue", value: res });
        }
      },
    },
    render() {
      if (!this.display) return null;
      return (
        <el-form model={this.formModel} label-position="top" ref="formRef">
          <el-form-item>
            <div
              class={css`
                width: 100px;
                height: 120px;
                box-sizing: border-box;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
              `}
            >
              <span style="color:#606266">
                文字提示
                {this.__configField.tipContent && <GuideNormalTip tipContent={this.__configField.tipContent} />}
                {this.__configField.tipOption && <GuideLubricationServiceTip tipOption={this.__configField.tipOption} />}
              </span>
              <UploadImg ref="textTipUploadImg" hideFieldName={true} defaultValue={this.imgUrl} limit={1} disabled={true} readOnly={this.disabledEditForm ? true : false} />
            </div>
          </el-form-item>
        </el-form>
      );
    },
  },
  { ...useExtendConfig({ defaultValue: { type: String, default: "" } }) }
);

export const TextImgTipProperty = Vue.extendWithMixin({
  created() {
    this.revertImg();
  },
  data() {
    return {
      imgUrl: [],
    };
  },
  methods: {
    revertImg() {
      const defaultValue = this.activeField._configField.defaultValue;
      if (defaultValue) {
        this.imgUrl = [defaultValue];
      }
    },
    changeImg(e) {
      this.changeFieldConfig("__img", e);
    },
  },
  render() {
    return (
      <div>
        <PropertyFields.Input
          fieldRules={[{ required: true, message: "请输入字段名称", trigger: "blur" }]}
          onChangeValue={(e) => this.changeFieldConfig("fieldName", e)}
          defaultValue={this.configField.fieldName}
        />
        <PropertyFields.UploadImg defaultValue={this.imgUrl} limit={1} fieldName="上传图片" onChangeValue={this.changeImg} />
        <PropertyFields.SwitchH fieldName="是否必填" pText="是" nText="否" onChangeValue={(e) => this.changeFieldConfig("requireFlag", e)} defaultValue={this.configField.requireFlag} />
        <PropertyFields.Input fieldName="Dollar符" maxlength={15} defaultValue={this.configField.documentPlace} onChangeValue={(e) => this.changeFieldConfig("documentPlace", e)} />
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
