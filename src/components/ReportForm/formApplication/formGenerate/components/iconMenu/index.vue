<template>
  <div class="icon-menu-container">
    <div v-for="item in menuData" :key="item.componentType" class="icon-type">
      <header class="icon-title">{{ item.componentType }}</header>
      <section class="icon-item-list">
        <IconItem v-for="icon in item.subMenuData" :key="icon.name" :iconItem="icon" @click.native="() => clickComponentIcon(icon)" />
      </section>
    </div>
  </div>
</template>

<script>
import { menuData } from "./config";
import IconItem from "./iconItem.vue";
const { inject } = VueCompositionAPI;
export default {
  components: {
    IconItem,
  },
  props: {
    renderDone: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      menuData,
    };
  },
  methods: {
    clickComponentIcon(icon) {
      if (this.renderDone) {
        this.createFormField(icon);
      }
    },
  },
  setup() {
    const createFormField = inject("createFormField");
    return {
      createFormField,
    };
  },
};
</script>

<style lang="less" scoped>
.icon-menu-container {
  box-sizing: border-box;
  padding-top: 5px;
  position: relative;
  width: 100%;
  height: 98%;
  border-radius: 12px;
}
.icon-title {
  font-weight: bolder;
  font-size: 16px;
  margin-bottom: 8px;
  margin-top: 15px;
}
.icon-type {
  margin-top: 10px;
}
.icon-item-list {
  padding-right: 10px;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
</style>
