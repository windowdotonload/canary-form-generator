<script>
export default {
  model: {
    prop: "propFileList",
    event: "changeFileList"
  },
  props: {
    uploadType: {
      type: String, // 'image' | 'video' | 'file'
      require: true,
      default: "image"
    },
    propFileList: {
      type: Array,
      default: []
    },
    fileType: {
      type: String,
      default: ""
    },
    uploadBtnText: {
      type: String,
      default: "上传文件"
    },
    limit: {
      type: Number,
      default: 1
    },
    fileSizeLimit: {
      type: Number
    },
    multiple: {
      type: Boolean,
      default: false
    },
    width: {
      type: [String, Number]
    },
    height: {
      type: [String, Number]
    },
    amplify: {
      type: Boolean,
      default: true
    },
    controls: {
      type: Boolean,
      default: true
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    accept: {
      type: String
    },
    useSlot: {
      type: Boolean,
      default: false
    },
    previewAble: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    downloadable:{
      type: Boolean,
      default: false
    }
  },
  components: {
    UploadImg: () => import("./uploadImg.vue"),
    UploadVideo: () => import("./uploadVideo.vue"),
    UploadFile: () => import("./uploadFile.vue")
  },
  data() {
    return {
      uploadTypeMap: {
        image: "UploadImg",
        video: "UploadVideo",
        file: "UploadFile"
      },
      slotNames: ["uplaodBtn"]
    };
  },
  watch: {
    limit(val) {
      this.$children.forEach(child => {
        child.fileList = [];
      });
    }
  },
  methods: {
    clearFileList() {
      this.propFileList = [];
    }
  },
  render(h) {
    const self = this;
    const scopedSlots = {};
    this.slotNames.forEach(slot => {
      if (this.$scopedSlots[slot]) scopedSlots[slot] = this.$scopedSlots[slot];
    });
    const renderObj = {
      on: {
        changeFileList: function(val) {
          self.$emit("changeFileList", val);
        }
      },
      props: {
        ...this.$props
      }
    };
    if (Object.keys(scopedSlots).length > 0) renderObj.scopedSlots = scopedSlots;
    return h(this.uploadTypeMap[this.uploadType], renderObj);
  }
};
</script>
