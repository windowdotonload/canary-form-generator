<template>
  <FormCreate />
</template>

<script>
import FormCreate from "./index.vue";
import { getGuideListReq, clearGuideList } from "../api/api.js";
export default {
  components: {
    FormCreate,
  },
  created() {
    getGuideListReq();
  },
  beforeDestroy() {
    clearGuideList();
  },
};
</script>
