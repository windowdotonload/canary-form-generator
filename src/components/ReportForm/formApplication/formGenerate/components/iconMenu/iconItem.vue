<template>
  <div class="icon-menu">
    <img :src="iconItem.icon" class="menu-icon-logo" />
    {{ iconItem.name }}
  </div>
</template>

<script>
export default {
  props: {
    iconItem: {
      type: Object,
      default() {
        return {};
      }
    }
  }
};
</script>

<style lang="less" scoped>
.icon-menu {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 43%;
  background: rgba(0, 20, 80, 0.03);
  border-radius: 6px;
  padding: 9px 0;
  margin-bottom: 10px;
  margin-right: 10px;
  padding-left: 32px;
  font-size: 12px;
  border: 1px solid rgba(0, 20, 80, 0.03);
  color: #666;
  overflow: hidden;
  cursor: pointer;
}
.icon-menu:hover {
  border: 1px solid rgb(221, 0, 0);
  border-radius: 6px;
  background: rgba(221, 0, 0, 0.05);
  box-shadow: 0 0 1px rgba(221, 0, 0, 0.8);
}
.icon-menu:hover::after {
  content: "+";
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #dd0000;
  font-size: 13px;
  width: 15px;
  height: 15px;
  border-top-left-radius: 6px;
  bottom: 0px;
  right: 0px;
}
.menu-icon-logo {
  position: absolute;
  left: 10px;
}
</style>
