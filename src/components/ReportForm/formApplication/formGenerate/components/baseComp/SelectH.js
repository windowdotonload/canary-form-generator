import { useCommonMixin, useExtendConfig, generateUniqueUUID, createDialog, checkFieldItemInPropertyPanel, useState } from "../uitls/index";
import PropertyFields from "../material";
import { GuideTipProperty, GuideNormalTip, GuideLubricationServiceTip } from "../systemComp/GuideTip";
import { formOperationState, findComponentForDisplayRule } from "../../formOperation";

export const SelectH = Vue._$extend(
  {
    mixins: [useCommonMixin()],
    mounted() {
      this.initDefaultValue();
    },
    data() {
      return {
        formModel: { value: null },
      };
    },
    methods: {
      handleConfig(fieldInfo) {
        const { configProperty, value } = fieldInfo;
        if (configProperty === "defaultValue") {
          this.formModel.value = value;
        }
      },
      initDefaultValue() {
        if (Array.isArray(this.defaultValue)) {
          this.defaultValue = this.defaultValue.filter((_) => _);
        }
        this.formModel.value = this.defaultValue || null;
        if (this.multiDefault && typeof this.defaultValue == "string" && this.defaultValue) this.formModel.value = this.defaultValue.split(",").filter((_) => _);
        this.handleDisplay();
      },
      changeValue(e) {
        this.formModel.value = e;
        this.$emit("changeValue", this.formModel.value);
        this.handleDisplay();
      },
      async handleDisplay() {
        await this.$nextTick();
        if (!this.disabledEditForm) return;
        if (!this.__configField.displayRule) return;

        const rule = JSON.parse(this.__configField.displayRule);
        if (rule.displayControl) {
          const displayControl = rule.displayControl.filter((item) => item[0].value && item[1].value.length);

          const fieldHitValueMap = {};
          displayControl.forEach((item) => {
            const hitValue = item[0].value;
            const fields = item[1].value;
            fields.forEach((field) => {
              const key = field.toString();
              if (!fieldHitValueMap[key]) fieldHitValueMap[key] = [hitValue];
              if (!fieldHitValueMap[key].includes(hitValue)) {
                fieldHitValueMap[key].push(hitValue);
              }
            });
          });

          displayControl.forEach((displayRle) => {
            const [selectInfo, contorlInfo] = displayRle;
            const selectValue = selectInfo.value;
            const contorlFields = contorlInfo.value;
            contorlFields.forEach((contorlFieldValue) => {
              const display = !this.display ? false : fieldHitValueMap[contorlFieldValue.toString()].includes(this.formModel.value);
              findComponentForDisplayRule(contorlFieldValue, display, this.indexOfButtonGroup, this.uuidOfButtonForBG);
            });
            return selectValue == this.formModel.value;
          });
        }
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
              clearable
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
        default: [],
      },
      multiDefault: { type: Boolean, default: false },
      defaultValue: { type: String, default: "" },
    }),
  }
);

export const SelectFieldProperty = Vue.extendWithMixin({
  watch: {
    "activeField._configField.fieldName": {
      handler() {
        this.handleDisplayOptions();
      },
    },
  },
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
  created() {
    this.revertDisplayControlProperty();
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
          if (![9].includes(child._uFieldInfo._configField.componentType)) {
            child.value = child._uFieldInfo.__uuid;
            child.label = child._uFieldInfo._configField.fieldName;
            item.children.push(child);
          }
          // 处理Tab和组合添加按钮和只读字段
          if ([8, 9, 10].includes(child._uFieldInfo._configField.componentType)) {
            const childComponentType = child._uFieldInfo._configField.componentType;
            const children = child._uFieldInfo._configField.children;
            if (children && children.length) {
              children.forEach((subChild) => {
                if (subChild.tabComponentModule) {
                  const module = subChild.tabComponentModule;
                  const tabChildrenList = module._uFieldInfo._configField.children;
                  if (!tabChildrenList || !tabChildrenList.length) return;
                  tabChildrenList.forEach((field) => {
                    field.value = field.__uuid;
                    field.label = `${module._uFieldInfo._configField.fieldName}Tab - ` + field._uFieldInfo._configField.fieldName;
                    item.children.push(field);
                  });
                } else {
                  const labelPrefix = childComponentType == 9 ? "" : child._uFieldInfo._configField.fieldName + "-";
                  const temp = {
                    value: subChild.__uuid,
                    label: labelPrefix + subChild._uFieldInfo._configField.fieldName,
                  };
                  item.children.push(temp);
                }
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
    changeSelectOptFefaultvalue(e) {
      const { options, value } = e;
      this.configOptions = options;
      this.changeFieldConfig("defaultValue", value);
      this.changeFieldConfig("options", options);
    },
    changeTipType(e) {
      this.guideType = e;
    },
    changeShowControl(e, type) {
      if (type == "fieldControl" && !e) {
        this.$refs.fieldControlRef && this.$refs.fieldControlRef.clearInnerControlList();
        const displayRule = this.activeField._configField.displayRule;
        if (!displayRule) return;
        const rule = JSON.parse(displayRule);
        rule.displayControl = "";
        this.changeFieldConfig("displayRule", JSON.stringify(rule));
      } else if (type == "pdfControl" && !e) {
        this.$refs.pdfControlRef && this.$refs.pdfControlRef.clearInnerControlList();
        const displayRule = this.activeField._configField.displayRule;
        if (!displayRule) return;
        const rule = JSON.parse(displayRule);
        rule.pdfDisplayControl = "";
        this.changeFieldConfig("displayRule", JSON.stringify(rule));
      } else if (type == "abnormalControl") {
        if (!e) {
          this.$refs.abnormalControlRef && this.$refs.abnormalControlRef.clearControlValue("abnormalControlValue");
          this.changeFieldConfig("abnormalValues", "");
        }
        this.changeFieldConfig("abnormalSync", e ? 1 : 0);
      }
      this[type] = e;
    },
    changeControlValue(e) {
      const { controlType, value } = e;
      if (controlType === "abnormalControl") {
        this.changeFieldConfig("abnormalValues", value.join(","));
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
        <PropertyFields.SelectRelOptForDefault
          maxOptionCount={10}
          defaultOptions={this.configField.options}
          defaultSelValue={this.configField.defaultValue}
          onChangeValue={this.changeSelectOptFefaultvalue}
        />
        <PropertyFields.SwitchH defaultValue={this.fieldControl} fieldName="是否有选项，控制其它字段显隐" pText="是" nText="否" onChangeValue={(e) => this.changeShowControl(e, "fieldControl")} />
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
        <PropertyFields.SwitchH
          defaultValue={this.configField.abnormalSync ? 1 : 0}
          fieldName="是否有选项，需要同步至设备异常记录"
          pText="是"
          nText="否"
          onChangeValue={(e) => this.changeShowControl(e, "abnormalControl")}
        />
        <PropertyFields.DisplayControl
          ref="abnormalControlRef"
          show={this.abnormalControl}
          hideFieldName={true}
          defaultValue={this.configField.abnormalValues}
          options1={this.configOptions}
          controlType="abnormalControl"
          onChangeValue={this.changeControlValue}
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

/** 是否有选项，控制报告PDF字段显隐
<PropertyFields.SwitchH defaultValue={this.pdfControl} fieldName="是否有选项，控制报告PDF字段显隐" pText="是" nText="否" onChangeValue={(e) => this.changeShowControl(e, "pdfControl")} />
<PropertyFields.DisplayControl
  ref="pdfControlRef"
  controlType="pdfDisplayControl"
  show={this.pdfControl}
  hideFieldName={true}
  controlList={this.pdfRule}
  options1={this.configOptions}
  options2={this.contorlListOfFieldList}
  onChangeValue={this.changeControlValue}
/>
*/
