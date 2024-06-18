import { useCommonMixin, useExtendConfig, generateUniqueUUID } from "../uitls/index";
import { css } from "@emotion/css";
import { menuData } from "../iconMenu/config.js";
import { cloneDeep } from "lodash";
import { EVENTBUS, changeActiveField } from "../../formOperation.js";
import PropertyFields from "../material";

const findCompConfigInfo = (compontType) => {
  const target = menuData[0].subMenuData.find((item) => item.componentType == compontType);
  if (target) return cloneDeep(target);
  return Object.create(null);
};
export const TabBar = Vue._$extend(
  {
    inject: ["createFormField"],
    mixins: [useCommonMixin()],
    data() {
      return {
        activeTab: "",
        activeIndex: 0,
        childrenRenderList: [],
      };
    },
    provide() {
      return {
        hideModuleName: true,
      };
    },
    created() {
      this.initTabList();
    },
    methods: {
      getComponentValue() {
        return this.childrenRenderList.map((_, index) => {
          const componentInstance = this.$refs[`module${index}`];
          const Fied = componentInstance.getFieldComponentInstance();
          const FiedValue = Fied.getComponentValue && Fied.getComponentValue();
          return FiedValue;
        });
      },
      initTabList() {
        if (this.children && this.children.length) {
          this.children.forEach((child) => {
            child.label = child.value = child.configField ? child.configField.fieldName : "选项1";
          });
          this.handleChildrenRenderList(this.children);
        }
      },
      handleConfig(e) {
        const { configProperty, value } = e;
        if (configProperty == "__children") {
          if (!Array.isArray(value)) return;
          value.forEach((item) => {
            if (item.value) item.fieldName = item.value;
            if (item.tabComponentModule && item.tabComponentModule._uFieldInfo) {
              item.tabComponentModule._uFieldInfo._configField.fieldName = item.value;
            }
          });
          this.handleChildrenRenderList(value);
        }
      },
      handleChildrenRenderList(list) {
        this.childrenRenderList = list.map((child) => {
          if (child.tabComponentModule && child.tabComponentModule._uFieldInfo) return child;
          const compConfigInfo = findCompConfigInfo(11);
          compConfigInfo.configField.__disableTabOption = true;
          if (child.configField) compConfigInfo.configField = child.configField;
          if (child.fieldName) compConfigInfo.configField.fieldName = child.fieldName;
          if (!compConfigInfo.configField.woParentUuid) compConfigInfo.configField.woParentUuid = this.__CtorUUID;
          const compFieldInfo = this.createFormField(compConfigInfo, /** returnOnly */ true);
          child.tabComponentModule = compFieldInfo;
          return child;
        });
        this.activeTab = this.childrenRenderList[this.activeIndex].value;
        EVENTBUS.$emit(this.__CtorUUID, { configProperty: "children", value: this.childrenRenderList });
      },
      tabClick(event, e) {
        e.stopPropagation();
        this.activeIndex = event.index;
        changeActiveField(this.childrenRenderList[this.activeIndex].tabComponentModule._uFieldInfo);
      },
    },
    render() {
      if (!this.display) return null;
      return (
        <div style="padding-top:30px">
          <el-tabs type="card" value={this.activeTab} on-tab-click={($evet, e) => this.tabClick($evet, e)}>
            {this.childrenRenderList.map((item, index) => {
              return (
                <el-tab-pane label={item.label} name={item.value}>
                  <item.tabComponentModule.Cotr
                    _uFieldInfo={item.tabComponentModule._uFieldInfo}
                    ref={`module` + index}
                    style="padding:0;margin-top:-55px;width:102%;margin-left: -1%"
                    disabledEditForm={this.disabledEditForm}
                  />
                </el-tab-pane>
              );
            })}
          </el-tabs>
        </div>
      );
    },
  },
  {
    ...useExtendConfig({
      children: {
        type: Array,
        default: [
          {
            value: "选项1",
            label: "选项1",
            tabComponentModule: null,
          },
        ],
      },
    }),
  }
);

export const TabBarProperty = Vue.extendWithMixin({
  data() {
    return {
      multiLine: false,
      options: [{ value: "tab1", label: "tab1", key: generateUniqueUUID() }],
    };
  },
  created() {
    this.initTabList();
  },
  methods: {
    initTabList() {
      const { _configField } = this.activeField;
      if (_configField.children && _configField.children.length) {
        this.options = cloneDeep(_configField.children);
      }
    },
    getTabList(e) {
      this.changeFieldConfig("__children", cloneDeep(e));
    },
  },
  render() {
    return (
      <div>
        <PropertyFields.SelectOptions options={this.options} onGetOptions={this.getTabList} />
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
