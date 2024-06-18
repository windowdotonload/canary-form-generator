import { cloneDeep } from "lodash";
import { useCommonMixin, useExtendConfig, generateUniqueUUID } from "../uitls/index";
import { css } from "@emotion/css";
import { EVENTBUS, formOperationState } from "../../formOperation.js";
import { queryDevice, queryLubricationPointDetail, deleteFormComponent } from "../../../api/api.js";
import PropertyFields from "../material";

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
    { value: "oilBoxCapacityUnit", label: "油箱容量" },
    { value: "lubricationPointPicPath", label: "润滑点图片" },
    { value: "lubricationPointDesc", label: "润滑点描述" },
    { value: "recommendOilName", label: "设备制造商推荐油品" },
    { value: "lubricationPointManufacturer", label: "润滑点设备制造商名称" },
    { value: "preMonthOilAddQuantityUnit", label: "每月润滑剂添加量" },
    { value: "everyTimeOilAddQuantityUnit", label: "每次加油量" },
    { value: "oilAddPeriod", label: "加油周期" },
    { value: "lastOilAddDate", label: "上次加油日期" },
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
      };
    },
    created() {
      this.initFieldList();
      this.getReqInfoDetail();
    },
    methods: {
      async getReqInfoDetail() {
        if (!this.disabledEditForm) return;
        await this.getInfo();
        console.log("this is getReqInfoDetail", this.deviceInfo, this.lubInfo);
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
        list = cloneDeep(list);
        const handleList = list.map((child) => {
          if (child._uFieldInfo && child._uFieldInfo._configField) return child;
          const copyObj = cloneDeep(child);
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
          this.childrenRenderList = cloneDeep(list);
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
                    class={css`
                      display: flex;
                      flex-wrap: wrap;
                      box-sizing: border-box;
                      padding: 10px;
                      margin: 0;
                      width: 25%;
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
                      `}
                    >
                      {this.disabledEditForm ? (item.sourceType == 1 ? this.deviceInfo[item.sourceField] || "--" : this.lubInfo[item.sourceField] || "--") : "--"}
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
  data() {
    return {
      sourceType: this.singleFieldConfig.sourceType || 1,
    };
  },
  methods: {
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
