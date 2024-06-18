import { SelectOptions } from "./SelectOptions";
import { SelectH } from "./SelectH";
import { useCommonMixin, useExtendConfig, checkFieldItemInPropertyPanel, useState } from "../uitls/index";

export const SelectRelOptForDefault = Vue._$extend(
  {
    mixins: [useCommonMixin()],
    created() {
      this.initDefaultValue();
    },

    data() {
      return {
        defaultValue: "",
        options: [],
      };
    },
    methods: {
      initDefaultValue() {
        if (this.defaultOptions) this.options = this.defaultOptions;
        this.defaultValue = this.defaultSelValue;
        if (this.multiDefault && typeof this.defaultValue == "string") this.defaultValue = this.defaultValue.split(",");
      },
      getOptions(options) {
        this.options = options.slice();
        this.handleDefaultValue(options);
        this.$emit("changeValue", { value: this.defaultValue, options: this.options.slice() });
      },
      handleDefaultValue(options) {
        if (!this.$refs.select_h) return;
        const optionsValue = options.map((item) => item.value);
        const defaultValue = this.$refs.select_h.getAssignValue();
        if (Array.isArray(defaultValue)) {
          defaultValue.some((val) => {
            if (!optionsValue.includes(val)) {
              defaultValue.splice(defaultValue.indexOf(val), 1);
              this.$refs.select_h.changeValue([...defaultValue]);
              return true;
            }
          });
          return;
        }
        if (defaultValue && !optionsValue.includes(defaultValue)) this.$refs.select_h.changeValue("");
      },
      changeValue(e) {
        this.defaultValue = e;
        this.$emit("changeValue", { value: e, options: this.options.slice() });
      },
    },
    render() {
      return (
        <div>
          <SelectOptions fieldName="选项" onGetOptions={this.getOptions} options={this.options} />
          <SelectH
            ref="select_h"
            fieldName={this.selectHFieldName}
            defaultValue={this.defaultValue}
            options={this.options}
            placeholder="不选择为无默认值"
            onChangeValue={this.changeValue}
            multiDefault={this.multiDefault}
          />
        </div>
      );
    },
  },
  {
    ...useExtendConfig({
      selectHFieldName: { type: String, default: "默认值" },
      defaultOptions: { type: Array, default: null },
      defaultSelValue: { type: String, default: "" },
      multiDefault: {
        type: Boolean,
        default: false,
      },
    }),
  }
);
