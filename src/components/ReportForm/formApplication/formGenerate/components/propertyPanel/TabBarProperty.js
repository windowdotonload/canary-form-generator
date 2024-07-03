import PropertyFields from "../material";
import { EVENTBUS } from "../../formOperation.js";
import { menuData } from "../iconMenu/config.js";
import { generateUniqueUUID } from "../uitls/index.js";
export const configMixin = (rawOptions) => {
  return {
    methods: {
      changeFieldConfig(configProperty, value) {
        EVENTBUS.$emit(`${this.activeField.__uuid}`, { configProperty, value });
      },
    },
  };
};
Vue.extendWithMixin = (rawOptions) => {
  const extendOptions = {
    _COMPONENTTYPE: "PROPERTY",
    mixins: [configMixin(rawOptions)],
    props: {
      activeField: {
        type: Object,
        default: () => ({}),
      },
    },
  };
  const options = Object.assign({}, extendOptions, rawOptions);
  return Vue.extend(options);
};
export const TabBarProperty = Vue.extendWithMixin({
  data() {
    return {
      multiLine: false,
      options: [{ value: "tab1", label: "tab1", key: generateUniqueUUID() }],
    };
  },
  created() {
    const { _configField } = this.activeField;
    if (_configField.children && _configField.children.length) {
      this.options = _configField.children;
    }
  },
  methods: {
    getTabList(e) {
      this.changeFieldConfig("children", e);
    },
  },
  render() {
    return (
      <div>
        <PropertyFields.SelectOptions options={this.options} onGetOptions={this.getTabList} />
      </div>
    );
  },
});
