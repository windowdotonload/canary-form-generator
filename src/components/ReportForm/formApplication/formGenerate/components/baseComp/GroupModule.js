import { useCommonMixin, useExtendConfig, checkFieldItemInPropertyPanel, useState, generateUniqueUUID } from "../uitls/index";
import { deleteFormComponent, clearLubAndDeviceInfo } from "../../../api/api";
import { menuData } from "../iconMenu/config.js";
import { EVENTBUS, formOperationState } from "../../formOperation.js";
import { css, cx } from "@emotion/css";
import PropertyFields from "../material";
import CreateDevice from "../../../../../equipment/components/CreateDevice.vue";

const findCompConfigInfo = (compontType) => {
  const target = menuData[0].subMenuData.find((item) => item.componentType == compontType);
  if (target) return JSON.parse(JSON.stringify(target));
  return Object.create(null);
};
export const GroupModule = Vue._$extend(
  {
    inject: ["createFormField", "hideModuleName", "saveForm"],
    mixins: [useCommonMixin()],
    data() {
      return {
        childrenRenderList: [],
        deviceTypeDialog: "editDeviceAndLumPoint",
        selectLubricationPointNumber: "",
        addDeviceDialog: false,
        epInfo: {},
        resource: "",
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
          const value = componentInstance && componentInstance.getComponentValue();
          return value;
        });
      },
      generateCSS() {
        if (!this.disabled) {
          return cx(
            "form-generator-content-table-container",
            css`
              position: relative;
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
          document.startViewTransition(() => this.handleChildrenRenderList(value));
          // if (opType && opType == "change") {
          //   document.startViewTransition(() => this.handleChildrenRenderItem(value));
          // } else {
          //   document.startViewTransition(() => this.handleChildrenRenderList(value));
          // }
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
        EVENTBUS.$emit(this.__CtorUUID, { configProperty: "children", value: this.childrenRenderList });
      },
      handleChildrenRenderList(list) {
        const checkKeyIsUUID = (key) => typeof key == "string" && key.length == 10 && key.includes("-");
        this.childrenRenderList = list
          .filter((item) => item.value || item.componentType)
          .map((child) => {
            const findComponentType = child.value ? child.value : child.componentType;
            const compConfigInfo = findCompConfigInfo(findComponentType);
            if (child.configField) {
              compConfigInfo.configField = child.configField;
            }
            if (child.prevSelectCompItem && child.prevSelectCompItem.configField) {
              compConfigInfo.configField.woComponentId = child.prevSelectCompItem.configField.woComponentId;
            }
            if (child.key && checkKeyIsUUID(child.key)) {
              compConfigInfo.configField.woComponentUuid = child.key;
            }
            if (!compConfigInfo.configField.woParentUuid) {
              compConfigInfo.configField.woParentUuid = this.__CtorUUID;
            }
            const compFieldInfo = this.createFormField(compConfigInfo, /** returnOnly */ true);
            return compFieldInfo;
          });
        EVENTBUS.$emit(this.__CtorUUID, { configProperty: "children", value: this.childrenRenderList });
      },
      async groupModuleChildrenOperation(opType, fieldInfo) {
        const index = this.childrenRenderList.findIndex((item) => item.__uuid == fieldInfo.__uuid);
        if (index == -1) return;
        const temp = this.childrenRenderList[index];
        if (opType == "delete") {
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
      async handleFillInfo(e) {
        await this.saveForm(0, false);
        e.stopPropagation();
        this.resource = "report";
        let res = await this.requestMethodGet("/web/device/queryDevice", { deviceNumber: this.$route.query.deviceNumber });
        if (res.data.code == 1000) {
          const data = res.data.data;
          data.createTime = this.moment(new Date(data.createTime)).format("YYYY-MM-DD");
          const date = new Date().getTime();
          if (Math.floor((date - data.createTimeMills) / 1000 / 60 / 60 / 24) == 0) {
            data.creatNew = true;
          }
          if (Math.floor((date - data.updateTimeMills) / 1000 / 60 / 60 / 24) == 0) {
            data.editNew = true;
          }
          this.epInfo = data;
        }
        this.selectLubricationPointNumber = this.$route.query.lubricationPointNumber;
        this.addDeviceDialog = true;
        this.editDeviceType = "editSingle";
      },
      closeDialogAddDevice() {
        this.addDeviceDialog = false;
      },
      editDevice() {
        // clearLubAndDeviceInfo();
        // Object.keys(this.$refs).forEach(async (key) => {
        //   const instance = this.$refs[key].getFieldComponentInstance();
        //   if (instance && instance.refreshStaticInfo) {
        //     console.log("this is editDeviceeditDevice");
        //     await instance.refreshStaticInfo();
        //     this.closeDialogAddDevice();
        //   }
        // });
        window.location.reload();
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
          {this.__configField.tipContent && this.disabledEditForm && (
            <span
              class={css`
                position: absolute;
                right: 15px;
                font-size: 13px;
                margin-top: 10px;
                color: #001450;
                cursor: pointer;
                z-index: 999;
              `}
              onClick={this.handleFillInfo}
            >
              <i class="el-icon-edit" /> 前往补充
            </span>
          )}
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
          {this.addDeviceDialog && (
            <CreateDevice
              deviceTypeDialog={this.deviceTypeDialog}
              selectLubricationPointNumber={this.selectLubricationPointNumber}
              addDeviceDialog={this.addDeviceDialog}
              epInfo={this.epInfo}
              resource={this.resource}
              onAddOrEditDeviceAndLumpoint={this.editDevice}
              onCloseDialogAddDevice={this.closeDialogAddDevice}
            />
          )}
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
    console.log("this is createda_configField_configField", this.activeField, this.activeField._configField);
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
            item.configField = configField;
            return item;
          });
      }
      this.handleOptionsList(_configField);
    },

    handleOptionsList(_configField) {
      if (_configField.__disableTabOption) {
        this.optionsList = GroupModulePropertyOptionsList.filter((item) => item.value != 10);
      } else {
        this.optionsList = GroupModulePropertyOptionsList;
      }
    },
    getComList(e) {
      // if (e.opType == "change") {
      //   return this.changeFieldConfig("__children", { opType: "change", opItem: e.opItem, selectOptions: cloneDeep(e.selectOptions) });
      // }
      this.changeFieldConfig("__children", e.selectOptions);
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
              fieldName={"PDF展示方式" + this.configField.renderFormat}
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
          onChangeValue={(e) => this.changeFieldConfig("renderFormat", e ? this.configField.renderFormat || "normal" : "none")}
        />
        <PropertyFields.SwitchH defaultValue={this.configField.display} fieldName="是否默认在页面中展示" pText="是" nText="否" onChangeValue={(e) => this.changeFieldConfig("display", e)} />
        <PropertyFields.SwitchH
          defaultValue={this.configField.tipContent ? 1 : 0}
          fieldName="是否需要前往补充的链接"
          pText="是"
          nText="否"
          onChangeValue={(e) => this.changeFieldConfig("tipContent", e ? "前往补充" : "")}
        />
      </div>
    );
  },
});
