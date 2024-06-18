import { useCommonMixin, useExtendConfig, checkFieldItemInPropertyPanel, useState, generateUniqueUUID } from "../uitls/index";
import { deleteFormComponent } from "../../../api/api";
import { menuData } from "../iconMenu/config.js";
import { EVENTBUS, formOperationState } from "../../formOperation.js";
import { cloneDeep } from "lodash";
import { css, cx } from "@emotion/css";
import PropertyFields from "../material";

const findCompConfigInfo = (compontType) => {
  const target = menuData[0].subMenuData.find((item) => item.componentType == compontType);
  if (target) return cloneDeep(target);
  return Object.create(null);
};
export const GroupModule = Vue._$extend(
  {
    inject: ["createFormField", "hideModuleName"],
    mixins: [useCommonMixin()],
    data() {
      return {
        childrenRenderList: [],
      };
    },
    created() {
      this.initChildrenRenderList();
    },
    methods: {
      getComponentValue() {
        return this.childrenRenderList.map((item) => {
          const componentInstance = this.$refs[item.__uuid];
          if (item._uFieldInfo && [8, 9, 10, 14].includes(item._uFieldInfo._configField.componentType)) {
            const Fied = componentInstance.getFieldComponentInstance();
            const FiedValue = Fied.getComponentValue && Fied.getComponentValue();
            return FiedValue;
          }
          const value = componentInstance.getComponentValue();
          return value;
        });
      },
      generateCSS() {
        if (!this.disabled) {
          return cx(
            "form-generator-content-table-container",
            css`
              border-radius: 6px;
              box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
            `
          );
        }
      },
      initChildrenRenderList() {
        if (this.children && this.children.length) {
          this.handleChildrenRenderList(this.children);
        }
      },
      handleConfig(e) {
        const { configProperty, value } = e;
        if (configProperty == "__children") {
          const { opType, opItem, selectOptions } = value;
          if (opType && opType == "change") {
            document.startViewTransition(() => this.handleChildrenRenderItem(value));
          } else {
            document.startViewTransition(() => this.handleChildrenRenderList(value));
          }
        }
      },
      handleChildrenRenderItem(e) {
        const { opType, opItem, selectOptions } = e;
        const index = this.childrenRenderList.findIndex((item) => item.__uuid == opItem.key);
        if (index == -1) return this.handleChildrenRenderList(selectOptions);
        const findComponentType = opItem.value ? opItem.value : opItem.componentType;
        const compConfigInfo = findCompConfigInfo(findComponentType);
        compConfigInfo.configField.woParentUuid = this.__CtorUUID;
        const compFieldInfo = this.createFormField(compConfigInfo, /** returnOnly */ true);
        compFieldInfo.__uuid = opItem.key;
        compFieldInfo._uFieldInfo.__uuid = opItem.key;
        this.childrenRenderList.splice(index, 1, compFieldInfo);
      },
      handleChildrenRenderList(list) {
        this.childrenRenderList = list
          .filter((item) => item.value || item.componentType)
          .map((child) => {
            const findComponentType = child.value ? child.value : child.componentType;
            const compConfigInfo = findCompConfigInfo(findComponentType);
            if (child.configField) {
              compConfigInfo.configField = child.configField;
            }
            if (!compConfigInfo.configField.woParentUuid) {
              compConfigInfo.configField.woParentUuid = this.__CtorUUID;
            }
            const compFieldInfo = this.createFormField(compConfigInfo, /** returnOnly */ true);
            return compFieldInfo;
          });
        console.log("this is baseCompInfo", this.childrenRenderList);
        EVENTBUS.$emit(this.__CtorUUID, { configProperty: "children", value: this.childrenRenderList });
      },
      async groupModuleChildrenOperation(opType, fieldInfo) {
        const index = this.childrenRenderList.findIndex((item) => item.__uuid == fieldInfo.__uuid);
        if (index == -1) return;
        const temp = this.childrenRenderList[index];
        if (opType == "delete") {
          console.log("-----activeFieldfieldInfo-", fieldInfo);
          const woComponentUuid = formOperationState.activeField._configField.woComponentUuid;
          if (woComponentUuid) {
            const formData = new FormData();
            formData.append("uuid", woComponentUuid);
            const delteRes = await deleteFormComponent(formData);
            if (delteRes.data.code != 1000) return;
          }
          this.childrenRenderList.splice(index, 1);
          formOperationState.activeField = null;
        } else if (opType == "moveUp") {
          if (index == 0) return;
          this.childrenRenderList.splice(index, 1, this.childrenRenderList[index - 1]);
          this.childrenRenderList.splice(index - 1, 1, temp);
        } else if (opType == "moveDown") {
          if (index == this.childrenRenderList.length - 1) return;
          this.childrenRenderList.splice(index, 1, this.childrenRenderList[index + 1]);
          this.childrenRenderList.splice(index + 1, 1, temp);
        } else if (opType == "Topping") {
          this.childrenRenderList.splice(index, 1);
          this.childrenRenderList.unshift(temp);
        } else if (opType == "Bottoming") {
          this.childrenRenderList.splice(index, 1);
          this.childrenRenderList.push(temp);
        }
        EVENTBUS.$emit(this.__CtorUUID, { configProperty: "children", value: this.childrenRenderList });
      },
    },
    render() {
      if (!this.display) return null;
      return (
        <el-form
          model={this.formModel}
          label-position="top"
          class={this.generateCSS()}
          style={{
            "margin-top": this.hideModuleName ? "-30px" : this.disabled ? 0 : "8px",
          }}
        >
          <el-form-item style="box-sizing:border-box;padding-top:10px;overflow: hidden;">
            <div
              class={
                this.disabled
                  ? css`
                      position: relative;
                      width: 100%;
                      box-sizing: border-box;
                      background-color: #f5f5f5;
                      padding: 20px;
                      border-radius: 10px;
                      margin-top: 20px;
                    `
                  : css`
                      position: relative;
                      width: 100%;
                      box-sizing: border-box;
                      padding: 20px;
                      border-radius: 10px;
                      margin-top: 20px;
                    `
              }
            >
              {this.hideModuleName ? null : (
                <div
                  class={
                    this.disabled
                      ? css`
                          position: absolute;
                          font-weight: bold;
                          top: -30px;
                          left: 10px;
                        `
                      : css`
                          position: absolute;
                          font-weight: bold;
                          width: 100%;
                          border-bottom: 1px solid #ebeef5;
                          top: -30px;
                          height: 42px;
                          left: 0;
                          padding-left: 10px;
                          display: flex;
                          flex-wrap: nowrap;
                          align-items: center;
                        `
                  }
                >
                  {!this.disabled && (
                    <div
                      class={css`
                        width: 3px;
                        height: 16px;
                        margin-right: 8px;
                        background-color: #d10000;
                      `}
                    ></div>
                  )}
                  {this.fieldName}
                </div>
              )}
              {this.childrenRenderList.map((Field, index) => (
                <Field.Cotr
                  _uFieldInfo={Field._uFieldInfo}
                  key={Field.__uuid + "-" + Field._uFieldInfo._configField.componentType}
                  ref={Field.__uuid}
                  groupModuleChildrenOperation={this.groupModuleChildrenOperation}
                  disabledEditForm={this.disabledEditForm}
                  class={css`
                    margin: 13px 0;
                  `}
                />
              ))}
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
        default: [],
      },
    }),
  }
);

const GroupModulePropertyOptionsList = menuData[0].subMenuData
  .filter((item) => item.componentType != 11)
  .map((item) => {
    return {
      value: item.componentType,
      label: item.name,
    };
  });

export const GroupModuleProperty = Vue.extendWithMixin({
  data() {
    return {
      optionsList: [],
      options: [{ value: "", key: generateUniqueUUID() }],
    };
  },
  created() {
    this.revertGroupModuleProperty();
  },
  methods: {
    revertGroupModuleProperty() {
      const { _configField } = this.activeField;
      if (_configField.children && _configField.children.length) {
        this.options = _configField.children
          .filter((i) => i._uFieldInfo && i._uFieldInfo._configField)
          .map((item) => {
            const configField = item._uFieldInfo._configField;
            item.value = configField.componentType;
            item.label = configField.fieldName;
            item.key = item._uFieldInfo.__uuid;
            item.configField = cloneDeep(configField);
            return item;
          });
      }
      this.handleOptionsList(_configField);
    },

    handleOptionsList(_configField) {
      if (_configField.__disableTabOption) {
        this.optionsList = cloneDeep(GroupModulePropertyOptionsList.filter((item) => item.value != 10));
      } else {
        this.optionsList = cloneDeep(GroupModulePropertyOptionsList);
      }
    },
    getComList(e) {
      if (e.opType == "change") {
        return this.changeFieldConfig("__children", { opType: "change", opItem: e.opItem, selectOptions: cloneDeep(e.selectOptions) });
      }
      this.changeFieldConfig("__children", cloneDeep(e.selectOptions));
    },
  },
  render() {
    return (
      <div>
        {this.activeField._configField.woParentUuid ? null : (
          <div>
            <PropertyFields.Input
              fieldName="模块名称"
              maxlength={15}
              defaultValue={this.configField.fieldName}
              fieldRules={[{ required: true, message: "请输入字段名称", trigger: "blur" }]}
              onChangeValue={(e) => this.changeFieldConfig("fieldName", e)}
            />
            <PropertyFields.RadioH
              fieldName="PDF展示方式"
              defaultValue={this.configField.renderFormat}
              radioOptions={[
                { value: "normal", label: "按顺序平铺" },
                { value: "table", label: "表格左右分布" },
              ]}
              onChangeValue={(e) => this.changeFieldConfig("renderFormat", e)}
            />
            <PropertyFields.Input fieldName="Dollar符" maxlength={15} defaultValue={this.configField.documentPlace} onChangeValue={(e) => this.changeFieldConfig("documentPlace", e)} />
          </div>
        )}
        <PropertyFields.SelectOptions fieldName="模块子字段" optionsType={2} options={this.options} optionsList={this.optionsList} onGetOptions={this.getComList} />
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
