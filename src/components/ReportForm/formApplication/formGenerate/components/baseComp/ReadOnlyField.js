import { useCommonMixin, useExtendConfig, generateUniqueUUID } from "../uitls/index";
import { css } from "@emotion/css";
import { EVENTBUS, formOperationState } from "../../formOperation.js";
import { queryDevice, queryLubricationPointDetail, deleteFormComponent } from "../../../api/api.js";
import PropertyFields from "../material";
import OSSUploadCombine from "@/generalComponents/OSSUpload/index.vue";

export const sourceOptions = {
  1: [
    { value: "newBusinessFlag", label: "是否是新项目设备初装生意" },
    { value: "deviceName", label: "设备名称" },
    { value: "deviceTypeName", label: "设备类型" },
    { value: "workshopName", label: "所属车间" },
    { value: "customerVisibility", label: "是否对客户可见" },
    { value: "manufacturer", label: "制造商" },
    { value: "deviceModel", label: "设备型号" },
    { value: "deviceCode", label: "设备编码" },
    { value: "devicePosition", label: "设备位置" },
  ],
  2: [
    { value: "lubricationPointName", label: "润滑点设备名称" },
    { value: "lubricationPointType", label: "润滑点设备类型" },
    { value: "lubricationMethodName", label: "润滑方式" },
    { value: "currentOilName", label: "在用油名称" },
    { value: "oilBoxCapacity", label: "油箱容量" },
    { value: "lubricationPointPicRelativePath", label: "润滑点图片" },
    { value: "lubricationPointDesc", label: "润滑点描述" },
    { value: "recommendOilName", label: "设备制造商推荐油品" },
    { value: "oilChangeMethod", label: "定期或按质换油" },
    { value: "lubricationPointManufacturer", label: "润滑点设备制造商名称" },
    { value: "oilChangePeriod", label: "换油周期" },
    { value: "lastOilChangeDate", label: "上次换油日期" },
    { value: "preMonthOilAddQuantity", label: "每月润滑剂添加量" },
    { value: "everyTimeOilAddQuantity-1", label: "每次加油量" },
    { value: "oilAddPeriod-1", label: "加油周期" },
    { value: "lastOilAddDate-1", label: "上次加油日期" },
    { value: "everyTimeOilAddQuantity-2", label: "每次加脂量" },
    { value: "oilAddPeriod-2", label: "加脂周期" },
    { value: "lastOilAddDate-2", label: "上次加脂日期" },
  ],
};
export const sourceOptionsMap = {
  1: {
    newBusinessFlag: "是否是新项目设备初装生意",
    deviceName: "设备名称",
    deviceTypeName: "设备类型",
    workshopName: "所属车间",
    customerVisibility: "是否对客户可见",
    manufacturer: "制造商",
    deviceModel: "设备型号",
    deviceCode: "设备编码",
    devicePosition: "设备位置",
  },
  2: {
    lubricationPointName: "润滑点设备名称",
    lubricationPointType: "润滑点设备类型",
    lubricationMethodName: "润滑方式",
    currentOilName: "在用油名称",
    oilBoxCapacityUnit: "油箱容量",
    lubricationPointPicPath: "润滑点图片",
    lubricationPointDesc: "润滑点描述",
    recommendOilName: "设备制造商推荐油品",
    lubricationPointManufacturer: "润滑点设备制造商名称",
    preMonthOilAddQuantityUnit: "每月润滑剂添加量",
    everyTimeOilAddQuantityUnit: "每次加油量",
    oilAddPeriod: "加油周期",
    lastOilAddDate: "上次加油日期",
  },
};
export const ReadOnlyField = Vue._$extend(
  {
    mixins: [useCommonMixin()],
    data() {
      return {
        childrenRenderList: [],
        deviceInfo: {},
        lubInfo: {},
        unitMap: {
          M: "月",
          D: "天",
          Y: "年",
          H: "小时",
          KM: "公里",
        },
      };
    },
    created() {
      this.initFieldList();
      this.getReqInfoDetail();
    },
    methods: {
      handleFillFormDisplay(e, uuid) {
        console.log("handleFillFormDisplay", e, uuid);
      },
      async getReqInfoDetail() {
        if (!this.disabledEditForm) return;
        await this.getInfo();
      },
      async refreshStaticInfo() {
        if (!this.disabledEditForm) return;
        await this.getInfo();
        this.childrenRenderList = this.childrenRenderList.map((item) => item);
        this.$forceUpdate();
      },
      async getInfo() {
        const deviceRes = await queryDevice({
          deviceNumber: this.$route.query.deviceNumber,
        });
        const lubInfoRes = await queryLubricationPointDetail({
          lubricationPointNumber: this.$route.query.lubricationPointNumber,
        });

        if (deviceRes.data.code == 1000) {
          this.deviceInfo = deviceRes.data.data;
        }
        if (lubInfoRes.data.code == 1000) {
          this.lubInfo = lubInfoRes.data.data;
        }
      },
      getComponentValue() {
        return this.childrenRenderList.map((item) => {
          return {
            fieldInfo: {
              _configField: {
                ...item,
              },
            },
            formModel: {
              value: item.sourceType == 1 ? this.deviceInfo[item.sourceField] || "" : this.lubInfo[item.sourceField] || "",
            },
          };
        });
      },
      syncChildrenToConfigField() {
        if (!(this.childrenRenderList && this.childrenRenderList.length)) return;
        EVENTBUS.$emit(this.__CtorUUID, { configProperty: "children", value: this.handleEmitChildrenFormat(this.childrenRenderList) });
      },
      handleEmitChildrenFormat(list) {
        const handleList = list.map((child) => {
          if (child._uFieldInfo && child._uFieldInfo._configField) return child;
          const copyObj = JSON.parse(JSON.stringify(child));
          const woComponentUuid = generateUniqueUUID(10);
          const res = {
            __uuid: woComponentUuid,
          };
          res._uFieldInfo = {};
          delete copyObj.__id;
          delete copyObj._uFieldInfo;

          res._uFieldInfo._configField = {
            ...copyObj,
            componentType: 13,
            woParentUuid: this.__CtorUUID,
          };
          if (res._uFieldInfo._configField.sourceField == "lubricationPointPicRelativePath") {
            res._uFieldInfo._configField.componentType = 5;
          }
          return res;
        });
        return handleList;
      },
      initFieldList() {
        if (this.children && this.children.length) {
          const list = this.children.map((child) => {
            if (child.configField) {
              child.configField.__id = child.configField.woComponentUuid;
              return child.configField;
            }
            if (child._uFieldInfo && child._uFieldInfo._configField) {
              return child._uFieldInfo._configField;
            }
            return child;
          });
          this.childrenRenderList = list;
          this.syncChildrenToConfigField();
        }
      },
      handleConfig(e) {
        const { configProperty, value } = e;
        if (configProperty === "__fieldList") {
          this.childrenRenderList = value;
          this.syncChildrenToConfigField();
        } else if (configProperty === "__singleField") {
          this.childrenRenderList = this.childrenRenderList.map((item) => {
            if (item.__id != value.__id) {
              return item;
            } else {
              return value;
            }
          });
          this.syncChildrenToConfigField();
        }
      },
      handleFieldDisplayRuleForLubType(displayRule) {
        if (!this.disabledEditForm) return false;
        if (!displayRule) return false;
        const ruleArr = displayRule.split(":");
        if (ruleArr[0] == "hideValue") {
          const disableValue = ruleArr[1].split(",");
          return disableValue.includes(this.lubInfo.lubricationMethodName);
        }
        return false;
      },
      handleLubFieldInfo(item) {
        const basicKey = item.sourceField.split("-")[0];
        const basicFieldInfo = this.lubInfo[basicKey] || "--";
        if (["everyTimeOilAddQuantity", "oilBoxCapacity", "preMonthOilAddQuantity"].includes(basicKey)) {
          const unitKey = basicKey + "Unit";
          return basicFieldInfo + (this.lubInfo[unitKey] || "--");
        }
        if (item.sourceField == "oilChangeMethod") {
          return basicFieldInfo == "--" ? basicFieldInfo : basicFieldInfo == 1 ? "定期" : "按质";
        }

        if (["oilChangePeriod", "oilChangePeriod", "oilChangePeriod", "oilAddPeriod"].includes(basicKey)) {
          const unitKey = basicKey + "Unit";
          return basicFieldInfo + (this.unitMap[this.lubInfo[unitKey]] || "--");
        }
        return basicFieldInfo;
      },
    },
    render() {
      if (!this.display) return null;
      return (
        <el-form model={this.formModel} label-position="top" class="form-generator-content-table-container">
          <el-form-item>
            <div
              class={css`
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: flex-start;
                flex-wrap: wrap;
              `}
            >
              {this.childrenRenderList.map((item) => {
                return (
                  <div
                    key={item.sourceType == 1 ? this.deviceInfo[item.sourceField] : this.lubInfo[item.sourceField]}
                    class={css`
                      display: flex;
                      flex-wrap: wrap;
                      box-sizing: border-box;
                      padding: 10px;
                      margin: 0;
                      width: 25%;
                      display: ${this.handleFieldDisplayRuleForLubType(item.displayRule) ? "none" : ""};
                    `}
                  >
                    <section
                      class={css`
                        margin-top: 20px;
                        width: 100%;
                      `}
                    >
                      {item.fieldName}
                    </section>
                    <section
                      class={css`
                        width: 100%;
                        // height: fit-content;
                        // overflow: hidden;
                        // text-overflow: ellipsis;
                        // white-space: nowrap;
                      `}
                    >
                      {this.disabledEditForm ? (
                        item.sourceType == 1 ? (
                          this.deviceInfo[item.sourceField] || "--"
                        ) : item.sourceField == "lubricationPointPicRelativePath" ? (
                          this.lubInfo[item.sourceField] ? (
                            <OSSUploadCombine
                              key={this.lubInfo[item.sourceField]}
                              disabled={true}
                              readOnly={true}
                              limit={1}
                              propFileList={[this.lubInfo[item.sourceField]]}
                              onChangeFileList={this.setFile}
                            />
                          ) : (
                            "暂无图片"
                          )
                        ) : (
                          this.handleLubFieldInfo(item) || "--"
                        )
                      ) : (
                        "--"
                      )}
                    </section>
                  </div>
                );
              })}
            </div>
          </el-form-item>
        </el-form>
      );
    },
  },
  {
    ...useExtendConfig({
      children: {
        type: String,
        default: [],
      },
    }),
  }
);

export const ReadOnlyFieldSingle = Vue.extend({
  props: {
    singleFieldConfig: {
      type: Object,
      default: () => ({}),
    },
    index: {
      type: Number,
      default: "",
    },
  },
  created() {
    this.revertLubPointControl();
  },
  data() {
    return {
      LubPointControlValue: [],
      sourceType: this.singleFieldConfig.sourceType || 1,
    };
  },
  methods: {
    revertLubPointControl() {
      const displayRule = this.singleFieldConfig.displayRule;
      if (displayRule) {
        const ruleArr = displayRule.split(":");
        if (ruleArr[0] == "hideValue") {
          if (ruleArr[1] && ruleArr[1].length) {
            this.LubPointControlValue = ruleArr[1].split(",");
          }
        }
      }
    },
    changeDataSoure(e) {
      this.sourceType = e;
      this.singleFieldConfig.sourceType = this.sourceType;
      this.$refs.sourceDataSelectH.changeValue("");
      this.$emit("changeValue", this.singleFieldConfig);
    },
    changeFieldName(e) {
      this.singleFieldConfig.fieldName = e;
      this.$emit("changeValue", this.singleFieldConfig);
    },
    changeDocumentPlace(e) {
      this.singleFieldConfig.documentPlace = e;
      this.$emit("changeValue", this.singleFieldConfig);
    },
    selectSourceData(e) {
      const findedItem = sourceOptions[this.sourceType].find((item) => item.value == e);
      if (findedItem) {
        this.singleFieldConfig.sourceName = findedItem.label;
        this.singleFieldConfig.sourceField = findedItem.value;
      } else {
        this.singleFieldConfig.sourceName = "";
        this.singleFieldConfig.sourceField = "";
      }
      this.$emit("changeValue", this.singleFieldConfig);
    },
    async deleteField() {
      if (this.singleFieldConfig.woComponentId) {
        const woComponentUuid = this.singleFieldConfig.woComponentUuid;
        if (woComponentUuid) {
          const formData = new FormData();
          formData.append("uuid", woComponentUuid);
          await deleteFormComponent(formData);
        }
      }
      this.$emit("deleteField", this.singleFieldConfig.__id);
    },
    changeLubPointControl(e) {
      this.singleFieldConfig.displayRule = `hideValue:${e.join(",")}`;
      this.$emit("changeValue", this.singleFieldConfig);
    },
  },
  render() {
    return (
      <div>
        <PropertyFields.Input
          fieldName="字段名称"
          defaultValue={this.singleFieldConfig.fieldName}
          fieldRules={[{ required: true, message: "请输入字段名称", trigger: "blur" }]}
          onChangeValue={this.changeFieldName}
        />
        <PropertyFields.RadioH
          fieldName="值的来源类型"
          fieldRules={[{ required: true, message: "请输入字段名称", trigger: "blur" }]}
          defaultValue={this.singleFieldConfig.sourceType || 1}
          radioOptions={[
            { value: 1, label: "设备信息" },
            { value: 2, label: "润滑点信息" },
          ]}
          onChangeValue={(e) => this.changeDataSoure(e)}
        />
        <PropertyFields.SelectH
          ref="sourceDataSelectH"
          fieldName="值的来源字段"
          fieldRules={[{ required: true, message: "请输入字段名称", trigger: "blur" }]}
          options={sourceOptions[this.singleFieldConfig.sourceType]}
          onChangeValue={(e) => this.selectSourceData(e)}
          defaultValue={this.singleFieldConfig.sourceField}
        />
        {this.singleFieldConfig.sourceType == 2 && (
          <PropertyFields.DisplayControl
            ref="lubPointControlRef"
            fieldName="润滑方式的字段显隐控制"
            show={1}
            text1="当润滑方式为"
            text2="报告页面不展示"
            lubPointControlValue={this.LubPointControlValue}
            controlList={this.displayRule}
            options1={this.configOptions}
            options2={this.contorlListOfFieldList}
            onChangeValue={this.changeLubPointControl}
            controlType="lubPointControl"
          />
        )}

        <PropertyFields.Input fieldName="Dollar符" maxlength={15} defaultValue={this.singleFieldConfig.documentPlace} onChangeValue={(e) => this.changeDocumentPlace(e)} />
        <el-button v-show={this.$parent.readonlyFieldConfigList.length > 1} size="mini" type="text" style="color:#d10000;margin-left:90%" onClick={this.deleteField}>
          删除
        </el-button>
      </div>
    );
  },
});

export const ReadOnlyFieldProperty = Vue.extendWithMixin({
  data() {
    return {
      readonlyFieldConfigList: [
        {
          __id: 1,
          fieldName: "字段名称",
          sourceType: 1,
          sourceField: "",
          documentPlace: "",
        },
      ],
    };
  },
  created() {
    this.revertReadOnlyFieldProperty();
  },
  methods: {
    revertReadOnlyFieldProperty() {
      const { _configField } = this.activeField;
      if (_configField.children && _configField.children.length) {
        this.readonlyFieldConfigList = _configField.children.map((item, index) => {
          let res = null;
          if (item._uFieldInfo && item._uFieldInfo._configField) {
            res = item._uFieldInfo._configField;
            res.__id = item._uFieldInfo._configField.woComponentUuid || index + 1;
          } else {
            res = item;
          }
          return res;
        });
      }
    },
    changeDataSoure(e) {
      this.sourceType = e;
    },
    addField() {
      const n = this.readonlyFieldConfigList.length;
      const newField = {
        __id: n + 1,
        fieldName: "字段名称",
        sourceType: 1,
        sourceField: "",
      };
      this.readonlyFieldConfigList.push(newField);
      this.changeFieldConfig("__fieldList", this.readonlyFieldConfigList);
    },
    configFieldList(e) {
      this.changeFieldConfig("__singleField", e);
    },
    deleteField(e) {
      if (this.readonlyFieldConfigList.length === 1) return this.$message("至少保留一个字段");
      const index = this.readonlyFieldConfigList.findIndex((item) => item.__id === e);
      this.readonlyFieldConfigList.splice(index, 1);
      this.changeFieldConfig("__fieldList", this.readonlyFieldConfigList);
    },
  },
  render() {
    return (
      <div>
        {this.readonlyFieldConfigList.map((item, index) => {
          return <ReadOnlyFieldSingle key={item.__id} index={index} singleFieldConfig={item} onChangeValue={this.configFieldList} onDeleteField={this.deleteField} />;
        })}
        <el-button v-show={this.readonlyFieldConfigList.length < 4} size="mini" type="text" onClick={this.addField}>
          + 添加
        </el-button>
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
