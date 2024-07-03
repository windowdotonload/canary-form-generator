import { useCommonMixin, useExtendConfig, generateUniqueUUID } from "../uitls/index";
import { css } from "@emotion/css";
import { menuData } from "../iconMenu/config.js";
import { EVENTBUS, findComponentWithUUID, changeActiveField } from "../../formOperation.js";
import PropertyFields from "../material";

const findCompConfigInfo = (compontType) => {
  const target = menuData[0].subMenuData.find((item) => item.componentType == compontType);
  if (target) return JSON.parse(JSON.stringify(target));
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
          const Fied = componentInstance && componentInstance.getFieldComponentInstance();
          const FiedValue = Fied && Fied.getComponentValue && Fied.getComponentValue();
          return FiedValue;
        });
      },
      initTabList() {
        if (this.children && this.children.length) {
          this.children.forEach((child, index) => {
            child.label = child.value = child.configField ? child.configField.fieldName : child.value || `选项${index + 1}`;
          });
          this.handleChildrenRenderList(this.children);
        }
      },
      async handleConfig(e) {
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
      async handleChildrenRenderList(list) {
        this.childrenRenderList = list.map((child) => {
          if (child.tabComponentModule && child.tabComponentModule._uFieldInfo) return child;
          const compConfigInfo = findCompConfigInfo(11);
          compConfigInfo.configField.__disableTabOption = true;
          if (child.configField) compConfigInfo.configField = child.configField;
          if (child.value) compConfigInfo.configField.fieldName = child.value;
          if (!compConfigInfo.configField.woParentUuid) compConfigInfo.configField.woParentUuid = this.__CtorUUID;
          const compFieldInfo = this.createFormField(compConfigInfo, /** returnOnly */ true);
          child.tabComponentModule = compFieldInfo;
          return child;
        });
        this.activeTab = this.childrenRenderList[this.activeIndex].value;
        EVENTBUS.$emit(this.__CtorUUID, { configProperty: "children", value: this.childrenRenderList });
      },
      tabClick(event, e) {
        e && e.stopPropagation();
        this.activeIndex = event.index;
        const target = findComponentWithUUID(this.childrenRenderList[this.activeIndex].tabComponentModule.__uuid);
        changeActiveField(target._uFieldInfo);
      },
    },
    render() {
      if (!this.display) return null;
      return (
        <div style="padding-top:30px">
          <el-tabs type="card" value={this.activeTab} on-tab-click={($evet, e) => this.tabClick($evet, e)}>
            {this.childrenRenderList
              .filter((item) => !this.disabledEditForm || (this.disabledEditForm && item.configField.display))
              .map((item, index) => {
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
          {
            value: "选项2",
            label: "选项2",
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
  watch: {
    "activeField._configField.children": {
      handler(val) {
        this.initTabList(val);
      },
    },
  },
  methods: {
    initTabList() {
      const { _configField } = this.activeField;
      if (_configField.children && _configField.children.length) {
        this.options = _configField.children;
      }
    },
    getTabList(e) {
      this.changeFieldConfig("__children", e);
    },
  },
  render() {
    return (
      <div>
        <PropertyFields.SelectOptions key={this.activeField._configField.children.length} options={this.options} onGetOptions={this.getTabList} maxOptionCount={20} />
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
