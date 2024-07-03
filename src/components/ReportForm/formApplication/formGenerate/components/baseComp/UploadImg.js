import { useCommonMixin, useExtendConfig, checkFieldItemInPropertyPanel, revertFieldItemEditValue, useState } from "../uitls/index";
import OSSUploadCombine from "@/generalComponents/OSSUpload/index.vue";
import PropertyFields from "../material";
import { GuideTipProperty, GuideNormalTip, GuideLubricationServiceTip } from "../systemComp/GuideTip";
import ImgUploadCut from "../systemComp/uploadImg.vue";
import { getFullUrl } from "../../../api/api.js";

export const UploadImg = Vue._$extend(
  {
    mixins: [useCommonMixin()],
    data() {
      return {
        cutHeight: 200,
        cutWidth: 200,
        setConfigStatus: false,
        formModel: {
          value: "",
          propFileList: [],
        },
      };
    },
    created() {
      this.initDefaultVale();
      this.initCutInfo();
    },
    methods: {
      async initCutInfo() {
        if (!this.disabledEditForm) return;
        const displayRule = this.__configField.displayRule;
        if (!displayRule) return;
        const { height, width } = JSON.parse(displayRule);
        this.cutHeight = height;
        this.cutWidth = width;
      },
      async initDefaultVale() {
        if (!this.defaultValue) return;
        const fileHalfPathArray = Array.isArray(this.defaultValue) ? this.defaultValue : this.defaultValue.split(",");
        const REQALL = Promise.all(
          fileHalfPathArray.map(async (item) => {
            const temp = {
              halfPath: item,
            };
            const fullurl = await getFullUrl({
              url: item,
            });
            temp.url = fullurl || "";
            return temp;
          })
        );
        this.formModel.propFileList = await REQALL;
        this.formModel.value = this.formModel.propFileList.map((item) => item.halfPath).join(",");
      },
      setFile(e) {
        /** needly field:
         * {
         *  halfPath: "https://oss.abc.com/xxx.jpg",
         *  url: "https://oss.abc.com/xxx.jpg",
         * }
         * */
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
            {(!this.disabledEditForm || !this.__configField.displayRule) && (
              <OSSUploadCombine
                disabled={this.disabled}
                readOnly={this.readOnly}
                limit={this.limit}
                fileType="work_order_picture"
                uploadType="image"
                propFileList={this.formModel.propFileList}
                onChangeFileList={this.setFile}
              />
            )}
            {this.disabledEditForm && !!this.__configField.displayRule && (
              <ImgUploadCut limit={this.limit} cutWidth={parseInt(this.cutWidth)} cutHeight={parseInt(this.cutHeight)} propFileList={this.formModel.propFileList} onChangeFileList={this.setFile} />
            )}
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
      cutHeight: "",
      cutWidth: "",
    };
  },
  created() {
    this.revertCutInfo();
  },
  methods: {
    revertCutInfo() {
      const { _configField } = this.activeField;
      const displayRule = _configField.displayRule;
      if (displayRule) {
        const { height, width } = JSON.parse(displayRule);
        this.cutHeight = height;
        this.cutWidth = width;
        this.cutShow = 1;
      }
    },
    changeCutControlShow(e) {
      this.cutShow = e;
      if (!e) {
        this.changeFieldConfig("displayRule", "");
      }
    },
    chanegCutInfo(type, e) {
      const { _configField } = this.activeField;
      let displayRule = _configField.displayRule;
      if (displayRule) {
        displayRule = JSON.parse(displayRule);
        displayRule[type] = e;
        this.changeFieldConfig("renderFormat", `${displayRule.height || 0}:${displayRule.width || 0}`);
        this.changeFieldConfig("displayRule", JSON.stringify(displayRule));
        return;
      }
      const temp = {
        [type]: e,
      };
      this.changeFieldConfig("displayRule", JSON.stringify(temp));
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
        <PropertyFields.Input fieldName="上传图片上限" defaultValue={this.configField.lengthMax} onChangeValue={(e) => this.changeFieldConfig("lengthMax", e)} />
        <PropertyFields.SwitchH defaultValue={this.configField.requireFlag} fieldName="是否必填" pText="是" nText="否" onChangeValue={(e) => this.changeFieldConfig("requireFlag", e)} />
        <PropertyFields.SwitchH defaultValue={this.cutShow} fieldName="图片是否需要裁剪" pText="是" nText="否" onChangeValue={this.changeCutControlShow} />
        {this.cutShow != 0 && (
          <div>
            <PropertyFields.Input
              fieldName="高度（像素）"
              defaultValue={this.cutHeight}
              fieldRules={[{ required: true, message: "请输入高度", trigger: "blur" }]}
              onChangeValue={(e) => this.chanegCutInfo("height", e)}
            />
            <PropertyFields.Input
              fieldName="宽度（像素）"
              defaultValue={this.cutWidth}
              fieldRules={[{ required: true, message: "请输入高度", trigger: "blur" }]}
              onChangeValue={(e) => this.chanegCutInfo("width", e)}
            />
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
          onChangeValue={(e) => this.changeFieldConfig("renderFormat", e ? this.configField.renderFormat : "none")}
        />
        <PropertyFields.SwitchH defaultValue={this.configField.display} fieldName="是否默认在页面中展示" pText="是" nText="否" onChangeValue={(e) => this.changeFieldConfig("display", e)} />
      </div>
    );
  },
});
