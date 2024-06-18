import { useCommonMixin, useExtendConfig, checkFieldItemInPropertyPanel, useState } from "../uitls/index";

export const TimePickerH = Vue._$extend(
  {
    mixins: [useCommonMixin()],
    data() {
      return {
        formModel: {
          time: "",
        },
      };
    },
    created() {
      this.initDefaultVale();
    },
    methods: {
      initDefaultVale() {
        if (this.defaultValue) {
          this.formModel.time = new Date(this.defaultValue);
        }
      },
      setTime(e) {
        this.formModel.time = e;
        this.$emit("changeValue", this.formModel.time);
      },
      getAssignValue() {
        return this.formModel.time;
      },
    },
    render() {
      if (!this.display) return null;
      return (
        <el-form model={this.formModel} label-position="top">
          <el-form-item rules={this.fieldRules} label={this.fieldName}>
            <el-time-picker disabled={this.disabled} size="mini" value={this.formModel.time} placeholder="选择时间" onInput={this.setTime} />
          </el-form-item>
        </el-form>
      );
    },
  },
  {
    ...useExtendConfig({
      defaultValue: { type: String, default: "" },
    }),
  }
);
