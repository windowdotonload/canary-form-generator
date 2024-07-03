import { useCommonMixin, useExtendConfig } from "../uitls/index";
import { css } from "@emotion/css";

export const lubOptions1 = [
  { value: "循环", label: "循环" },
  { value: "飞溅/油浴", label: "飞溅/油浴" },
  { value: "喷射", label: "喷射" },
  { value: "其它油润滑", label: "其它油润滑" },
  { value: "油雾", label: "油雾" },
  { value: "手刷", label: "手刷" },
  { value: "滑脂枪", label: "滑脂枪" },
  { value: "集中供脂", label: "集中供脂" },
  { value: "其它脂润滑", label: "其它脂润滑" },
];
export const DisplayControl = Vue._$extend(
  {
    mixins: [useCommonMixin()],
    data() {
      return {
        disableControlValue: "",
        abnormalControlValue: [],
        innerControlList: [[{ value: "" }, { value: [] }]],
        options1Selected: [],
        options2Selected: [],
        lubPointControlValueSelf: "",
      };
    },
    created() {
      this.initLubPointControlValue();
      this.initDefaultValue();
      this.initControlList();
    },
    beforeDestroy() {
      this.clearInnerControlList();
    },
    methods: {
      initLubPointControlValue() {
        if (this.controlType == "lubPointControl") {
          this.lubPointControlValueSelf = this.lubPointControlValue;
        }
      },
      clearControlValue(clearyKey) {
        if (clearyKey === "abnormalControlValue") {
          this[clearyKey] = [];
        } else {
          this[clearyKey] = "";
        }
      },
      clearInnerControlList() {
        this.options1Selected = [];
        this.options2Selected = [];
        this.innerControlList = [[{ value: "" }, { value: [] }]];
      },
      initDefaultValue() {
        if (this.controlType == "abnormalControl" && this.defaultValue) {
          this.abnormalControlValue = this.defaultValue.split(",");
        } else if (this.controlType == "disableControl" && this.defaultValue) {
          this.disableControlValue = this.defaultValue;
        }
      },
      initControlList() {
        if (this.controlType == "displayControl" || this.controlType == "pdfDisplayControl") {
          if (this.controlList && this.controlList.length > 0) {
            this.innerControlList = this.controlList.map((item) => {
              return item;
            });
            this.options1Selected = this.innerControlList.map((item) => item[0].value);
            this.options2Selected = this.innerControlList.flatMap((item) => item[1].value);
          }
        }
      },
      addOption() {
        this.innerControlList.push([{ value: "" }, { value: [] }]);
        this.$emit("changeValue", { controlType: this.controlType, value: this.innerControlList });
      },
      deleteOption(index) {
        if (this.innerControlList.length === 1) return this.$message.warning("至少保留一条规则");
        const deleteValue = this.innerControlList[index];
        this.options1Selected = this.options1Selected.filter((item) => item !== deleteValue[0].value);
        this.innerControlList.splice(index, 1);
        this.$emit("changeValue", { controlType: this.controlType, value: this.innerControlList });
      },
      changeValue(controlType, e, index, innerIndex) {
        const emitaValue = {};
        let value = e;
        if (["displayControl", "pdfDisplayControl"].includes(controlType)) {
          this.innerControlList[index][innerIndex].value = e;
          this.options1Selected = this.innerControlList.map((item) => item[0].value);
          this.options2Selected = this.innerControlList.flatMap((item) => item[1].value);
          value = this.innerControlList;
        } else if (controlType === "disableControl") {
          this.disableControlValue = e;
        } else if (controlType === "abnormalControl") {
          this.abnormalControlValue = e;
        }
        emitaValue.controlType = controlType;
        emitaValue.value = value;
        this.$emit("changeValue", emitaValue);
      },
      changeLubPointControl(e) {
        this.lubPointControlValueSelf = e;
        this.$emit("changeValue", e);
      },
    },
    render() {
      return (
        <el-form model={this.formModel} label-position="top" ref="formRef">
          {this.show == 1 && ["displayControl", "pdfDisplayControl"].includes(this.controlType) && (
            <el-form-item rules={this.fieldRules} label={this.hideFieldName ? "" : this.fieldName}>
              {this.innerControlList.map((item, index) => {
                return (
                  <div
                    class={css`
                      font-size: 13px;
                      margin-bottom: 10px;
                      padding-left: 3px;
                    `}
                  >
                    <span
                      class={css`
                        position: absolute;
                        display: inline-block;
                        left: -8px;
                      `}
                    >
                      {index + 1}.
                    </span>
                    {this.text1 || "选中"}
                    <el-select
                      placeholder="请选择"
                      size="mini"
                      value={item[0].value}
                      class={css`
                        margin: 0 5px;
                      `}
                      onChange={(e) => this.changeValue(this.controlType, e, index, 0)}
                    >
                      {this.options1.map((option) => {
                        return <el-option value={option.value} label={option.label} disabled={this.options1Selected.includes(option.value)} />;
                      })}
                    </el-select>
                    时,
                    <br />
                    {this.text2 ? this.text2 : this.controlType == "pdfDisplayControl" ? "不展示" : "展示"}
                    <el-cascader
                      size="mini"
                      options={this.options2}
                      props={{ multiple: true }}
                      collapse-tags
                      clearable
                      class={css`
                        margin: 0 5px;
                      `}
                      value={item[1].value}
                      onChange={(e) => this.changeValue(this.controlType, e, index, 1)}
                    />
                    <br />
                    <el-button size="mini" type="text" style="color:#d10000" onClick={() => this.deleteOption(index)}>
                      删除
                    </el-button>
                  </div>
                );
              })}
              <el-button size="mini" type="text" onClick={this.addOption}>
                + 添加
              </el-button>
            </el-form-item>
          )}
          {this.show == 1 && ["lubPointControl"].includes(this.controlType) && (
            <el-form-item rules={this.fieldRules} label={this.hideFieldName ? "" : this.fieldName}>
              {this.innerControlList.map((item, index) => {
                return (
                  <div
                    class={css`
                      font-size: 13px;
                      margin-bottom: 10px;
                      padding-left: 3px;
                    `}
                  >
                    {this.text1 || "选中"}
                    <el-select
                      placeholder="请选择"
                      size="mini"
                      value={this.lubPointControlValueSelf}
                      class={css`
                        margin: 0 5px;
                        width: 65%;
                      `}
                      multiple
                      collapse-tags
                      onChange={(e) => this.changeLubPointControl(e)}
                    >
                      {lubOptions1.map((option) => {
                        return <el-option value={option.value} label={option.label} />;
                      })}
                    </el-select>
                    时, 不展示
                  </div>
                );
              })}
            </el-form-item>
          )}
          {this.show == 1 && this.controlType == "disableControl" && (
            <el-form-item rules={this.fieldRules} label={this.hideFieldName ? "" : this.fieldName}>
              <div
                class={css`
                  font-size: 13px;
                  padding-left: 3px;
                `}
              >
                选中
                <el-select
                  placeholder="请选择"
                  size="mini"
                  class={css`
                    margin: 0 5px;
                  `}
                  value={this.disableControlValue}
                  onChange={(e) => this.changeValue(this.controlType, e)}
                >
                  {this.options1.map((option) => {
                    return <el-option value={option.value} label={option.label} />;
                  })}
                </el-select>
                时,
                <br />
                其它选项无法被选中。
              </div>
            </el-form-item>
          )}
          {this.show == 1 && this.controlType == "abnormalControl" && (
            <el-form-item rules={this.fieldRules} label={this.hideFieldName ? "" : this.fieldName}>
              <div
                class={css`
                  font-size: 13px;
                  margin-bottom: 10px;
                  padding-left: 3px;
                `}
              >
                选中
                <el-select
                  multiple={true}
                  collapse-tags={true}
                  placeholder="请选择"
                  size="mini"
                  class={css`
                    margin: 0 5px;
                  `}
                  value={this.abnormalControlValue}
                  onChange={(e) => this.changeValue(this.controlType, e)}
                >
                  {this.options1.map((option) => {
                    return <el-option value={option.value} label={option.label} />;
                  })}
                </el-select>
                时,
                <br />
                需要同步至设备异常记录。
              </div>
            </el-form-item>
          )}
        </el-form>
      );
    },
  },
  {
    ...useExtendConfig({
      show: {
        type: Boolean,
        default: true,
      },
      text1: {
        type: String,
        default: "",
      },
      text2: {
        type: String,
        default: "",
      },
      options1: {
        type: Array,
        default: [],
      },
      options2: {
        type: Array,
        default: [],
      },
      lubPointControlValue: {
        type: Array,
        default: "",
      },
      defaultValue: {
        type: Array,
        default: "",
      },
      controlType: {
        type: String,
        default: "displayControl",
      },
      controlList: {
        type: Array,
        default: () => [[{ value: "" }, { value: "" }]],
      },
    }),
  }
);
