import { useCommonMixin, useExtendConfig, generateUniqueUUID } from "../uitls/index";
import { deleteFormComponent } from "../../../api/api.js";
import PropertyFields from "../material";
import { css } from "@emotion/css";
import { menuData } from "../iconMenu/config";
import { EVENTBUS } from "../../formOperation.js";

const excludeComponentType = [8, 10, 11];
const groupItemOptions = menuData[0].subMenuData
  .filter((item) => !excludeComponentType.includes(item.componentType))
  .map((item) => {
    return {
      ...JSON.parse(JSON.stringify(item)),
      label: item.name,
      value: item.componentType,
    };
  });
export const GroupAddButton = Vue._$extend(
  {
    mixins: [useCommonMixin()],
    inject: ["formContentList", "createFormField"],
    created() {
      this.initChildrenRenderList();
      this.initFillFormGroup();
    },
    data() {
      return {
        groupList: [],
        childrenRenderList: [],
      };
    },
    methods: {
      getComponentValue() {
        return this.groupList.map((group, index) => {
          return group.map((Field) => {
            const componentInstance = this.$refs[Field.__uuid + index];
            const value = componentInstance.getComponentValue();
            value.fieldInfo.row = index + 1;
            return value;
          });
        });
      },
      handleFillFormDisplay(display, uuid /** uuid of find field */, indexOfButtonGroup) {
        if (indexOfButtonGroup < 0) return;
        const refKey = uuid + indexOfButtonGroup;
        const compInstance = this.$refs[refKey] && this.$refs[refKey].getFieldComponentInstance();
        console.log("compInstance", compInstance);
        if (!compInstance) return;
        compInstance.handleFillFormDisplay && compInstance.handleFillFormDisplay(display);
      },
      initChildrenRenderList() {
        if (this.disabledEditForm) return;
        if (this.children && this.children.length) {
          this.handleChildrenRenderList(this.children);
        }
      },
      initFillFormGroup() {
        if (!this.disabledEditForm) return;
        if (!this.__configField.__groupList) return;
        this.__configField.__groupList.forEach((item) => {
          const group = this.handleChildrenRenderList(item, false);
          if (!group) return;
          group.id = generateUniqueUUID();
          this.groupList.push(group);
        });
        EVENTBUS.$emit(this.__CtorUUID, { configProperty: "__group", value: this.groupList });
      },
      handleConfig(e) {
        const { configProperty, value } = e;
        if (configProperty == "options") {
          this.handleChildrenRenderList(value);
        }
      },
      addGroup() {
        if (this.groupList.length >= this.__configField.lengthMax) return ELEMENT.Message({ message: `最多添加${this.__configField.lengthMax}个组合`, type: "warning" });
        const group = this.handleChildrenRenderList(this.__configField.children, false);
        if (!group) return;
        group.id = generateUniqueUUID();
        this.groupList.push(group);
        EVENTBUS.$emit(this.__CtorUUID, { configProperty: "__group", value: this.groupList });
      },
      deleteGroup(index) {
        this.groupList.splice(index, 1);
      },
      handleChildrenRenderList(list, emit = true) {
        const findCompConfigInfo = (compontType) => {
          const target = menuData[0].subMenuData.find((item) => item.componentType == compontType);
          if (target) return JSON.parse(JSON.stringify(target));
          return Object.create(null);
        };
        this.childrenRenderList = list
          .filter((item) => item.value || item.componentType)
          .map((child) => {
            const findComponentType = child.value ? child.value : child.componentType;
            const compConfigInfo = findCompConfigInfo(findComponentType);
            if (child.configField) {
              compConfigInfo.configField = child.configField;
            }
            if (child.woComponentId) {
              compConfigInfo.configField.woComponentId = child.woComponentId;
              compConfigInfo.configField.woComponentUuid = child.woComponentUuid;
            }
            if (!compConfigInfo.configField.woParentUuid) {
              compConfigInfo.configField.woParentUuid = this.__CtorUUID;
            }
            compConfigInfo.hideOperationBar = true;
            const compFieldInfo = this.createFormField(compConfigInfo, /** returnOnly */ true);
            return compFieldInfo;
          });
        if (!emit) {
          return this.childrenRenderList;
        } else if (emit) {
          EVENTBUS.$emit(this.__CtorUUID, { configProperty: "children", value: this.childrenRenderList });
        }
      },
    },
    render() {
      if (!this.display) return null;
      return (
        <el-form model={this.formModel} label-position="top" class="form-generator-content-table-container">
          <el-form-item style="box-sizing:border-box;padding-top:10px">
            {this.disabledEditForm &&
              this.groupList.map((group, index) => {
                return (
                  <div
                    key={group.id}
                    class={css`
                      margin: 10px 0;
                    `}
                  >
                    {group.map((Field) => {
                      return (
                        <Field.Cotr
                          key={Field.__uuid}
                          uuidOfButtonForBG={this.__configField.woComponentUuid}
                          indexOfButtonGroup={index}
                          _uFieldInfo={Field._uFieldInfo}
                          disabledEditForm={true}
                          ref={Field.__uuid + index}
                        />
                      );
                    })}
                    <el-button size="mini" type="text" style="color:#d10000" onClick={() => this.deleteGroup(index)}>
                      删除
                    </el-button>
                  </div>
                );
              })}

            {!this.disabledEditForm && this.childrenRenderList.length > 0 && (
              <div
                class={css`
                  width: 100%;
                  height: fit-content;
                  background: rgba(102, 102, 102, 0.1);
                  margin-top: 26px;
                  border-radius: 8px;
                  box-sizing: border-box;
                  padding: 10px;
                `}
              >
                {this.childrenRenderList.map((Field, index) => (
                  <Field.Cotr
                    _uFieldInfo={Field._uFieldInfo}
                    key={Field.__uuid}
                    ref={Field.__uuid}
                    class={css`
                      margin: 13px 0;
                    `}
                  />
                ))}
              </div>
            )}
            <el-button disabled={!this.disabledEditForm} size="mini" style="margin-top: 10px;" onClick={this.addGroup}>
              {this.fieldName}
            </el-button>
          </el-form-item>
        </el-form>
      );
    },
  },
  {
    ...useExtendConfig({
      children: { type: Array, default: () => [] },
    }),
  }
);

export const GroupAddButtonProperty = Vue.extendWithMixin({
  inject: ["formContentList"],
  data() {
    return {
      groupItemList: [
        {
          value: "",
        },
      ],
      selectedOptions: [],
    };
  },
  created() {
    this.revertGroutButtonOptions(this.formContentList);
  },
  methods: {
    revertGroutButtonOptions() {
      const children = this.activeField._configField.children;
      if (Array.isArray(children) && children.length > 0) {
        this.groupItemList = this.activeField._configField.children.map((item) => {
          if (item._uFieldInfo && item._uFieldInfo._configField) {
            const configField = item._uFieldInfo._configField;
            return {
              value: configField.componentType || configField.value,
              ...configField,
            };
          }
        });
      }
    },
    changeSelect(e, selectItem) {
      selectItem.value = e;
      this.handleSelectedOptions();
    },
    handleSelectedOptions() {
      this.selectedOptions = this.groupItemList
        .filter((item) => item.value)
        .map((item) => {
          return item.value;
        });
      this.groupItemList = this.groupItemList.map((item) => item);
      this.changeFieldConfig("options", this.groupItemList);
    },
    addGroupItemList() {
      if (this.groupItemList.length >= 5)
        return ELEMENT.Message({
          message: `最多添加五个组合`,
          type: "warning",
        });
      this.groupItemList.push({
        value: "",
      });
      this.handleSelectedOptions();
    },
    async deleteGroupItemList(index, deleteGroupItemList) {
      if (deleteGroupItemList && deleteGroupItemList.woComponentUuid) {
        const formData = new FormData();
        formData.append("uuid", deleteGroupItemList.woComponentUuid);
        await deleteFormComponent(formData);
      }
      this.groupItemList.splice(index, 1);
      this.handleSelectedOptions();
    },
  },
  render() {
    return (
      <div>
        <PropertyFields.Input
          defaultValue={this.configField.fieldName}
          fieldName="按钮文案"
          fieldRules={[{ required: true, message: "请输入字段名称", trigger: "blur" }]}
          onChangeValue={(e) => this.changeFieldConfig("fieldName", e)}
        />
        <el-form label-position="top" class="form-generator-content-table-container">
          <el-form-item label="组合" rules={[{ required: true, message: "请输入字段名称", trigger: "blur" }]} style="box-sizing:border-box;padding-top:10px">
            {this.groupItemList.map((item, index) => {
              return (
                <div
                  class={css`
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    box-sizing: border-box;
                    padding: 0;
                    margin: 0;
                  `}
                >
                  <span
                    class={css`
                      color: #606266;
                      display: inlin-block;
                      width: 20%;
                    `}
                  >
                    组合{index + 1}：
                  </span>
                  <el-select placeholder="请选择" size="mini" style={{ width: "70%", marginBottom: "10px" }} value={item.value} onChange={(e) => this.changeSelect(e, item)}>
                    {groupItemOptions.map((option) => {
                      return <el-option label={option.label} value={option.value} />;
                    })}
                  </el-select>
                  <el-button
                    size="mini"
                    type="text"
                    style="color: #d10000;"
                    onClick={this.deleteGroupItemList.bind(this, index, item)}
                    class={css`
                      transform: translateY(-5px) translateX(10px);
                    `}
                  >
                    删除
                  </el-button>
                </div>
              );
            })}
          </el-form-item>
          <el-button
            size="mini"
            type="text"
            onClick={this.addGroupItemList}
            class={css`
              transform: translateY(-20px);
            `}
          >
            + 添加
          </el-button>
        </el-form>
        <PropertyFields.Input
          fieldName="组合数"
          defaultValue={this.configField.lengthMax}
          fieldRules={[{ required: true, message: "请输入组合数", trigger: "blur" }]}
          onChangeValue={(e) => this.changeFieldConfig("lengthMax", e)}
        />
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
