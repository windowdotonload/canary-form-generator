import { useCommonMixin, useExtendConfig, generateUniqueUUID, createDialog, checkFieldItemInPropertyPanel, useState } from "../uitls/index";
import PropertyFields from "../material";
import { GuideTipProperty, GuideNormalTip, GuideLubricationServiceTip } from "../systemComp/GuideTip";
import { css } from "@emotion/css";
import { EVENTBUS, formOperationState } from "../../formOperation.js";

export const SelectInput = Vue._$extend(
  {
    mixins: [useCommonMixin()],
    created() {
      this.initChildren();
    },
    data() {
      return {
        selectOptions: [],
        selectDefaultValue: "",
        inputDefaultValue: "",
        formModel: { value: null },
      };
    },
    methods: {
      initChildren() {
        if (this.children && this.children.length) {
          this.children = this.children.map((item) => {
            let res = null;
            if (item.configField) {
              res = item.configField;
            } else {
              item.woParentUuid = this.__CtorUUID;
              res = item;
            }

            if (res.componentType == 3) {
              this.selectDefaultValue = res.defaultValue;
              this.selectOptions = res.options;
            } else if (res.componentType == 1) {
              this.inputDefaultValue = res.defaultValue;
            }
            return res;
          });
          EVENTBUS.$emit(this.__CtorUUID, { configProperty: "children", value: this.children });
        }
      },
      handleConfig(fieldInfo) {
        const { configProperty, value } = fieldInfo;
        if (configProperty === "__children") {
          this.selectDefaultValue = value[0].defaultValue;
          this.inputDefaultValue = value[1].defaultValue;
          this.$refs.SELECT.formModel.value = this.selectDefaultValue;
          this.$refs.INPUT.formModel.value = this.inputDefaultValue;
        }
      },
      getComponentValue() {
        return this.children.map((item) => {
          return {
            fieldInfo: {
              _configField: {
                ...item,
              },
            },
            formModel: {
              value: item.componentType == 3 ? this.selectDefaultValue : this.inputDefaultValue,
            },
          };
        });
      },
      changeValue(key, e) {
        this[key] = e;
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
            <div
              class={css`
                width: 100%;
                display: flex;
                align-items: center;
                flesx-wrap: nowrap;
              `}
            >
              <PropertyFields.SelectH
                ref="SELECT"
                style="width:40%;margin-right:10px"
                defaultValue={this.selectDefaultValue}
                hideFieldName={true}
                disabled={!this.disabledEditForm}
                options={this.selectOptions}
                onChangeValue={(e) => this.changeValue("selectDefaultValue", e)}
              />
              <PropertyFields.Input
                ref="INPUT"
                style="width:40%"
                maxlength={this.maxlength}
                defaultValue={this.inputDefaultValue}
                placeholder="请输入内容"
                hideFieldName={true}
                disabled={!this.disabledEditForm}
                onChangeValue={(e) => this.changeValue("inputDefaultValue", e)}
              />
            </div>
          </el-form-item>
        </el-form>
      );
    },
  },
  {
    ...useExtendConfig({
      children: {
        type: Array,
        default: () => [
          {
            componentType: 3,
            fieldName: "下拉选择名称",
            requireFlag: 1,
            defaultValue: "",
            options: [
              { value: "ISO446", key: generateUniqueUUID() },
              { value: "NAS1638", key: generateUniqueUUID() },
            ],
            __uuid: generateUniqueUUID(10),
          },
          {
            componentType: 1,
            fieldName: "输入框名称",
            requireFlag: 1,
            lengthMax: 15,
            defaultValue: "",
            __uuid: generateUniqueUUID(10),
          },
        ],
      },
    }),
  }
);

export const SelectInputProperty = Vue.extendWithMixin({
  inject: ["formContentList"],
  data() {
    return {
      fieldControl: false,
      pdfControl: false,
      iControl: false,
      abnormalControl: false,
      configOptions: [],
      contorlListOfFieldList: [],
      displayRule: [[{ value: "" }, { value: [] }]],
      pdfRule: [[{ value: "" }, { value: [] }]],
    };
  },
  methods: {
    changeSelectOptFefaultvalue(e) {
      const { options, value } = e;
      this.configOptions = options;
      this.configField.children[0].woParentUuid = this.activeField.__uuid;
      this.configField.children[1].woParentUuid = this.activeField.__uuid;
      this.configField.children[0].options = options;
      this.configField.children[0].defaultValue = value;
      this.changeFieldConfig("__children", this.configField.children);
      this.changeFieldConfig("defaultValue", value);
    },
    changeInputConfig(key, e) {
      this.configField.children[1][key] = e;
      this.configField.children[1][key] = e;
      this.changeFieldConfig("children", this.configField.children);
    },
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
        <PropertyFields.SelectRelOptForDefault
          selectHFieldName="下拉框默认值"
          defaultOptions={this.configField.children[0].options}
          defaultSelValue={this.configField.defaultValue}
          onChangeValue={this.changeSelectOptFefaultvalue}
          maxOptionCount={10}
        />
        <PropertyFields.Input fieldName="输入框输入字数上限" maxlength={this.configField.lengthMax} defaultValue={this.configField.lengthMax} onChangeValue={(e) => this.changeLen(e)} />
        <PropertyFields.Input fieldName="输入框默认值" maxlength={15} defaultValue={this.configField.children[1].defaultValue} onChangeValue={(e) => this.changeInputConfig("defaultValue", e)} />
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
