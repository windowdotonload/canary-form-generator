<template>
  <div class="video-box" :style="{ width: width, height: height }">
    <div class="oss-video-container">
      <video :src="realPlayUrl" ref="ossVideo" controls controlsList="nodownload" class="oss-video-player"></video>
    </div>
  </div>
</template>

<script>
import { HttpOrHttpsReg } from "./data";
import { saveWatchTime } from "../../components/lubricationAssistant/api";
export default {
  props: {
    height: {
      type: [String, Number],
      default: "376px"
    },
    width: {
      type: [String, Number],
      default: "100%"
    },
    playUrl: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      realPlayUrl: ""
    };
  },
  created() {
    this.getPlayUrl();
  },
  beforeDestroy() {
    this.$emit("closed", this.$refs.ossVideo);
  },
  methods: {
    getPlayFullPath() {},
    async saveWatchDuration(chapterId) {
      const params = {
        chapterId: chapterId,
        duration: this.$refs.ossVideo.currentTime
      };
      await saveWatchTime(params);
    },
    getPlayUrl() {
      if (!this.playUrl) return;
      const isFullUrl = HttpOrHttpsReg.test(this.playUrl);
      if (isFullUrl) {
        this.realPlayUrl = this.playUrl;
      }
    }
  },
  watch: {
    playUrl() {
      this.getPlayUrl();
    }
  }
};
</script>

<style lang="less" scoped>
.video-box {
  overflow: hidden;
  box-sizing: border-box;
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 376px;
  background: rgba(0, 0, 0);
  border-radius: 12px;
}
.oss-video-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 100%;
}
.oss-video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
