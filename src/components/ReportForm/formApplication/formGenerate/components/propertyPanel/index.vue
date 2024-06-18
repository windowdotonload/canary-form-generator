<script>
import DiffFieldTypeProperty from "./config.js";
export default {
  props: {
    activeField: {
      type: Object,
      default: () => ({}),
    },
  },
  render() {
    const PropertyPanelComponent = this.activeField && this.activeField.propertyPanelComponent ? DiffFieldTypeProperty[this.activeField.propertyPanelComponent] : null;
    return (
      <div class="property-panel">
        <div class="property-panel-header">
          <div style="width:100%;font-weight: bolder;">属性&参数</div>
          {this.activeField && this.activeField.propertyPanelComponent ? (
            <div style="width:100%;margin-top:10px;color:#999">
              自定义组件：<span style="color:#d10000">{this.activeField.name}</span>
            </div>
          ) : null}
        </div>
        <div class="property-panel-content">
          {this.activeField && this.activeField.propertyPanelComponent && PropertyPanelComponent ? <PropertyPanelComponent key={this.activeField.__uuid} activeField={this.activeField} /> : null}
        </div>
      </div>
    );
  },
};
</script>

<style lang="less" scoped>
/deep/ .el-form-item {
  margin-bottom: 15px;
}
.property-panel-content::-webkit-scrollbar {
  display: none;
}
.property-panel {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 100%;
}
.property-panel-header {
  box-sizing: border-box;
  width: 100%;
  max-height: 70px;
  height: fit-content;
  background: rgba(238, 239, 245);
  padding: 10px 20px;
  color: #000;
  font-size: 15px;
  padding-top: 10px;
}
.property-panel-content {
  width: 100%;
  height: calc(100% - 110px);
  overflow-y: auto;
  padding: 10px 20px;
  box-sizing: border-box;
}
.property-panel-content:empty::after {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  content: "请点击选择需要编辑的组件";
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: #999;
}
</style>
