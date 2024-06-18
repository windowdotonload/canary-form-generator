import { useCommonMixin, useExtendConfig, checkFieldItemInPropertyPanel, revertFieldItemEditValue, useState } from "../uitls/index";
import OSSUploadCombine from "@/generalComponents/OSSUpload/index.vue";
import PropertyFields from "../material";
import { GuideTipProperty, GuideNormalTip, GuideLubricationServiceTip } from "../systemComp/GuideTip";

export const UploadImg = Vue._$extend(
  {
    mixins: [useCommonMixin()],
    data() {
      return {
        formModel: {
          value: "",
          propFileList: [],
        },
      };
    },
    created() {
      this.initDefaultVale();
    },
    methods: {
      initDefaultVale() {
        if (!this.defaultValue) return;
        this.formModel.propFileList = Array.isArray(this.defaultValue) ? this.defaultValue : this.defaultValue.split(",");
        this.formModel.value = this.formModel.propFileList.join(",");
      },
      setFile(e) {
        this.formModel.propFileList = e;
        this.formModel.value = this.formModel.propFileList.map((item) => item.halfPath).join(",");
        this.$emit("changeValue", this.formModel.propFileList);
      },
      clearFile() {
        this.formModel.propFileList = [];
        this.formModel.value = "";
        this.$emit("changeValue", this.formModel.propFileList);
      },
      getAssignValue() {
        return this.formModel.propFileList;
      },
    },
    render() {
      if (!this.display) return null;
      return (
        <el-form model={this.formModel} label-position="top">
          <el-form-item rules={this.fieldRules} label={this.hideFieldName ? "" : this.fieldName}>
            {this.hideFieldName ? null : (
              <span slot="label" style="cursor:pointer">
                {this.hideFieldName ? "" : this.fieldName}
                {this.__configField.tipContent && <GuideNormalTip tipContent={this.__configField.tipContent} />}
                {this.__configField.tipOption && <GuideLubricationServiceTip tipOption={this.__configField.tipOption} />}
              </span>
            )}
            <OSSUploadCombine
              disabled={this.disabled}
              readOnly={this.readOnly}
              limit={this.limit}
              fileType="knowledge_library"
              uploadType="image"
              v-model="field"
              propFileList={this.formModel.propFileList}
              onChangeFileList={this.setFile}
            />
          </el-form-item>
        </el-form>
      );
    },
  },
  {
    ...useExtendConfig({
      limit: { type: Number, default: 3 },
      readOnly: { type: Boolean, default: false },
      defaultValue: { type: Array, default: [] },
    }),
  }
);

export const UplaodImgFieldProperty = Vue.extendWithMixin({
  data() {
    return {
      cutShow: false,
    };
  },
  methods: {
    changeCutControlShow(e) {
      this.cutShow = e;
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
        <PropertyFields.Input fieldName="上传图片上限" />
        <PropertyFields.SwitchH defaultValue={this.configField.requireFlag} fieldName="是否必填" pText="是" nText="否" onChangeValue={(e) => this.changeFieldConfig("requireFlag", e)} />
        <PropertyFields.SwitchH defaultValue={this.cutShow} fieldName="图片是否需要裁剪" pText="是" nText="否" onChangeValue={this.changeCutControlShow} />
        {this.cutShow && (
          <div>
            <PropertyFields.Input fieldName="高度（像素）" fieldRules={[{ required: true, message: "请输入高度", trigger: "blur" }]} onChangeValue={(e) => this.changeFieldConfig("fieldName", e)} />
            <PropertyFields.Input fieldName="宽度（像素）" fieldRules={[{ required: true, message: "请输入高度", trigger: "blur" }]} onChangeValue={(e) => this.changeFieldConfig("fieldName", e)} />
          </div>
        )}
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
