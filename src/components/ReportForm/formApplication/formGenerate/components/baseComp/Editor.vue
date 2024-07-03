<template>
  <div style="border: 1px solid #ccc">
    <Toolbar style="border-bottom: 1px solid #ccc" :editor="editor" :defaultConfig="toolbarConfig" :mode="mode" />
    <Editor class="editor-class" v-model="value" :defaultConfig="editorConfig" :mode="mode" @onChange="changeValue" @onCreated="onCreated" />
  </div>
</template>
<script>
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";

export default {
  props: {
    defaultValue: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    maxLength: {
      typeL: Number,
      default: 50,
    },
  },
  components: { Editor, Toolbar },
  data() {
    return {
      value: "",
      editor: null,
      toolbarConfig: {
        excludeKeys: [
          "header1", // 标题1
          "header2", // 标题2
          "header3", // 标题3
          "color", // 字体颜色
          "bgColor", // 背景色
          "italic", // 斜体
          "through", // 删除线
          "clearStyle", // 清除格式
          "blockquote", // 引用
          "fontSize", // 字号
          "fontFamily", // 字体
          "lineHeight", // 行高
          "image", // 图片
          "codeBlock", // 代码块
          "insertLink", // 插入链接
          "emotion", // 表情
          "insertVideo", // 插入视频
          "group-image", // 图片
          "todo", // 待办
          "undo", // 撤销
          "redo", // 重做
          "|",
          "divider", // 分割线
          "fullScreen", // 全屏
          // 'insertTableRow', // 插入行
          // 'deleteTableRow', // 删除行
          // 'insertTableCol', // 插入列
          // 'deleteTableCol', // 删除列
          // 'tableHeader', // 表头
          // 'tableFullWidth' // 宽度自适应
        ],
        insertKeys: {
          index: 11, // 插入的位置，基于当前的 toolbarKeys
          keys: ["sub", "sup", "indent", "delIndent"],
        },
      },
      editorConfig: {
        placeholder: this.placeholder || "请输入...",
        maxLength: this.maxLength || 50,
        autoFocus: false,
        scroll: false,
      },
      mode: "simple", // or 'simple'
    };
  },
  created() {
    this.initDefaultValue();
  },
  methods: {
    initDefaultValue() {
      this.value = this.defaultValue;
    },
    onCreated(editor) {
      this.editor = Object.seal(editor); // 一定要用 Object.seal() ，否则会报错
    },
    changeValue(e) {
      this.$emit("changeValue", this.value);
    },
  },
  beforeDestroy() {
    const editor = this.editor;
    if (editor == null) return;
    editor.destroy(); // 组件销毁时，及时销毁编辑器
  },
};
</script>
<style src="@wangeditor/editor/dist/css/style.css"></style>
<style lang="less">
.editor-class .w-e-text-container table th {
  background-color: #fff !important;
  border-right-width: 1px !important;
}
.w-e-scroll {
  height: 300px !important;
}
.w-e-text-container table th {
  border: 1px solid #000 !important;
}
.w-e-text-container table td {
  border: 1px solid #000 !important;
}
</style>
