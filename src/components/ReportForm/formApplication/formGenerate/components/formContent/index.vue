<script>
import Skeleton from "../systemComp/skeleton.vue";
export default {
  components: {
    Skeleton,
  },
  props: {
    formContentList: {
      type: Array,
      default: () => [],
    },
    renderDone: {
      type: Boolean,
      default: true,
    },
  },
  render() {
    return (
      <div class="form-content-container">
        <div class="form-property-box">
          <div class="form-property-box-header">表单内容</div>
          <div class="form-property-box-content">
            {!this.renderDone ? (
              <Skeleton />
            ) : (
              <transition-group name="form-property-box-content-list">
                {this.formContentList.map((Field) => (
                  <Field.Cotr _uFieldInfo={Field._uFieldInfo} key={Field.__uuid} />
                ))}
              </transition-group>
            )}
          </div>
        </div>
      </div>
    );
  },
};
</script>

<style lang="less" scoped>
.form-content-container {
  display: flex;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 100%;
  background: #f2f3f6;
}
.form-property-box {
  position: relative;
  width: 92%;
  height: 95%;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  text-decoration: none;
  background-color: rgba(255, 255, 255, 0.5);
  margin-top: 15px;
  overflow: hidden;
}
.form-property-box::-webkit-scrollbar {
  display: none;
}
.form-property-box-header {
  background-color: #f9f9f9;
  padding: 0 20px;
  height: 39px;
  display: flex;
  align-items: center;
  color: #000;
  font-size: 15px;
  font-weight: bolder;
}
.form-property-box-header::before {
  content: "";
  display: inline-block;
  width: 5px;
  height: 20px;
  margin-right: 10px;
  background-color: rgb(209, 0, 0, 0.8);
}
.form-property-box-content {
  background: #fff;
  padding: 20px 50px;
  height: calc(100% - 82px);
  overflow-y: auto;
}
.form-property-box-content::-webkit-scrollbar {
  // display: none;
  width: 3px !important;
}
.form-property-box-content:empty::after {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  content: "请从左侧列表中点击需要添加组件";
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: #999;
}
</style>
<style>
.form-property-box-content-list-move {
  transition: transform 0.5s;
}
</style>
