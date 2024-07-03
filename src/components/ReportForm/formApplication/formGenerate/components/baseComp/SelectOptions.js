import { options } from "less";
import { useCommonMixin, useExtendConfig, generateUniqueUUID, checkFieldItemInPropertyPanel, useState } from "../uitls/index";
import { Input } from "./Input";
import { SelectH } from "./SelectH";
import { deleteFormComponent } from "../../../api/api";

export const SelectOptions = Vue._$extend(
  {
    mixins: [useCommonMixin()],
    data() {
      return {
        formModel: {
          selectOptions: [
            { value: "选项1", label: "选项1", key: generateUniqueUUID() },
            { value: "选项2", label: "选项2", key: generateUniqueUUID() },
          ],
        },
        moveBtnStyle: {
          "line-height": "30px",
          fontSize: "12px",
          marginLeft: "5px",
          cursor: "pointer",
        },
      };
    },
    beforeMount() {
      this.initOptions();
    },
    methods: {
      initOptions() {
        if (this.optionsType == 1) {
          if (this.options && this.options.length) {
            this.formModel.selectOptions = this.options;
            this.formModel.selectOptions.forEach((item) => {
              if (!item.label) item.label = item.value;
              if (!item.key) item.key = generateUniqueUUID();
            });
          }
        } else if (this.optionsType == 2) {
          this.formModel.selectOptions = this.options;
        }
        this.$emit("getOptions", this.optionsType == 1 ? this.formModel.selectOptions : { opType: "init", selectOptions: this.formModel.selectOptions });
      },
      setVal(e, item) {
        if (this.formModel.selectOptions.map((item) => item.value).includes(e)) {
          return ELEMENT.Message({ message: "选项值不能重复", type: "warning" });
        }
        item.label = e;
        item.value = e;
        this.$emit("getOptions", this.optionsType == 1 ? this.formModel.selectOptions : { opType: "setVal", selectOptions: this.formModel.selectOptions });
      },
      addOption() {
        if (this.formModel.selectOptions.length >= this.maxOptionCount) {
          return ELEMENT.Message({
            message: `最多添加${this.maxOptionCount}条选项`,
            type: "warning",
          });
        }
        if (this.optionsType == 1) {
          this.formModel.selectOptions.push({ value: `选项${this.formModel.selectOptions.length + 1}`, label: `选项${this.formModel.selectOptions.length + 1}`, key: generateUniqueUUID() });
        } else if (this.optionsType == 2) {
          this.formModel.selectOptions.push({ value: "", key: generateUniqueUUID() });
        }
        this.$emit("getOptions", this.optionsType == 1 ? this.formModel.selectOptions : { opType: "add", selectOptions: this.formModel.selectOptions });
      },
      async removeOpt(removeTarget) {
        const limit = this.optionsType == 1 ? 2 : 1;
        if (this.formModel.selectOptions.length <= limit) {
          return ELEMENT.Message({
            message: `最少保留${limit == 1 ? "一" : "两"}条选项`,
            type: "warning",
          });
        }
        const index = this.formModel.selectOptions.findIndex((item) => item.key === removeTarget.key);
        if (index > -1) {
          let deleteItem = this.formModel.selectOptions[index];
          if (deleteItem.tabComponentModule) deleteItem = deleteItem.tabComponentModule;
          const _configField = deleteItem._uFieldInfo && deleteItem._uFieldInfo._configField;
          if (_configField && _configField.woComponentId) {
            const formData = new FormData();
            const woComponentUuid = deleteItem._uFieldInfo._configField.woComponentUuid;
            if (woComponentUuid) {
              formData.append("uuid", woComponentUuid);
              await deleteFormComponent(formData);
            }
          }
          this.formModel.selectOptions.splice(index, 1);
        }
        this.$emit("getOptions", this.optionsType == 1 ? this.formModel.selectOptions : { opType: "delete", selectOptions: this.formModel.selectOptions });
      },
      sort(moveType, item) {
        //moveType 1 上移 2 下移
        const key = item.key;
        const index = this.formModel.selectOptions.findIndex((item) => item.key === key);
        if (index < 0) return;
        const targetIndex = moveType === 1 ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex > this.formModel.selectOptions.length - 1) return;
        const targetKey = this.formModel.selectOptions[targetIndex].key;
        const targetItem = this.formModel.selectOptions.find((item) => item.key === targetKey);
        this.formModel.selectOptions.splice(index, 1, targetItem);
        this.formModel.selectOptions.splice(targetIndex, 1, item);
        this.$emit("getOptions", this.optionsType == 1 ? this.formModel.selectOptions : { opType: "sort", selectOptions: this.formModel.selectOptions });
      },
      selectOptionsChange(e, item) {
        const index = this.formModel.selectOptions.findIndex((element) => element.key == item.key);
        if (index < 0) return;
        const changeTypeInfo = {
          componentType: e,
          value: e,
          key: item.key,
          prevSelectCompItem: { ...item },
        };
        this.formModel.selectOptions.splice(index, 1, changeTypeInfo);
        this.$emit("getOptions", this.optionsType == 1 ? this.formModel.selectOptions : { opType: "change", opItem: changeTypeInfo, selectOptions: this.formModel.selectOptions });
      },
    },
    render() {
      return (
        <el-form model={this.formModel} label-position="top">
          <el-form-item rules={this.fieldRules} style={{ marginBottom: "8px" }}>
            <label v-slot="label">{this.fieldName}</label>
            <span style={{ color: "#999", fontSize: "13px" }}>（上限：{this.maxOptionCount}项）</span>
          </el-form-item>
          <transition-group name="animation-list">
            {this.formModel.selectOptions.map((item, index) => {
              return (
                <div key={item.key}>
                  <div style={{ width: "100%", display: "flex", flexWrap: "nowrap" }}>
                    {this.optionsType == 1 && (
                      <Input
                        defaultValue={item.value}
                        maxlength="30"
                        hideFieldName
                        placeholder={`选项${index + 1}`}
                        onSetVal={(e) => this.setVal(e, item)}
                        style={{ width: "66%" }}
                        marginBottom="2%"
                      />
                    )}
                    {this.optionsType == 2 && (
                      <SelectH hideFieldName options={this.optionsList} defaultValue={item.value} onChangeValue={(e) => this.selectOptionsChange(e, item)} style={{ width: "66%" }} />
                    )}
                    <span style={{ ...this.moveBtnStyle, cursor: index == 0 ? "not-allowed" : "pointer", color: index == 0 ? "#B3B3B3" : "" }} onClick={() => this.sort(1, item)}>
                      上移
                    </span>
                    <span
                      style={{
                        ...this.moveBtnStyle,
                        cursor: index == this.formModel.selectOptions.length - 1 ? "not-allowed" : "pointer",
                        color: index == this.formModel.selectOptions.length - 1 ? "#B3B3B3" : "",
                      }}
                      onClick={() => this.sort(2, item)}
                    >
                      下移
                    </span>
                    <span style={{ ...this.moveBtnStyle, color: "#d10000" }} onClick={() => this.removeOpt(item)}>
                      删除
                    </span>
                  </div>
                </div>
              );
            })}
          </transition-group>
          <el-button type="text" style={{ color: "#808aa8", marginLeft: "5px" }} size="mini" onClick={this.addOption}>
            <i class="el-icon-plus" /> 添加
          </el-button>
        </el-form>
      );
    },
  },
  {
    ...useExtendConfig({
      options: {
        type: Array,
        default: [
          { value: "选项1", key: generateUniqueUUID() },
          { value: "选项2", key: generateUniqueUUID() },
        ],
      },
      maxOptionCount: {
        type: Number,
        default: 100,
      },
      optionsType: {
        type: Number,
        default: 1,
      },
      /**
       * optionsType 为 2 ， 选项为下拉框是的下拉列表
       * */
      optionsList: {
        type: Array,
        default: [
          { value: "选项1", key: generateUniqueUUID() },
          { value: "选项2", key: generateUniqueUUID() },
        ],
      },
    }),
  }
);
