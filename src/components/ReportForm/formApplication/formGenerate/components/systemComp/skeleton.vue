<template functional>
  <div class="skeleton-screen">
    <div class="skeleton-content" v-for="item in 60" :key="item" />
  </div>
</template>

<style lang="less" scoped>
@keyframes skeleton-animation {
  0% {
    background-position: -100%;
  }
  100% {
    background-position: 100%;
  }
}

.skeleton-screen {
  box-sizing: border-box;
  height: 100%;
  background-color: rgba(242, 242, 242, 0.3);
  border-radius: 4px;
  padding: 16px;
  overflow: hidden;
  opacity: 0.5;
}

.skeleton-header,
.skeleton-content,
.skeleton-footer {
  background-color: #e0e0e0;
  height: 16px;
  margin-bottom: 15px;
  border-radius: 4px;
  background: linear-gradient(90deg, transparent, rgba(224, 224, 224, 0.8), transparent);
  background-size: 400% 100%;
  animation: skeleton-animation 2s infinite linear;
}

.skeleton-content:first-child {
  width: 60%;
}

.skeleton-content:nth-child(3n) {
  width: 50%;
}

.skeleton-content:nth-child(5n) {
  width: 80%;
}

.skeleton-header {
  width: 80%;
}

.skeleton-content {
  width: 100%;
}

.skeleton-footer {
  width: 60%;
}
</style>
