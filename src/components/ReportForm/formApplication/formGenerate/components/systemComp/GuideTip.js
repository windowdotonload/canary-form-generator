import { useCommonMixin, useExtendConfig, generateUniqueUUID, createDialog, checkFieldItemInPropertyPanel, useState } from "../uitls/index";
import { getFullUrl, getGuideList, getGuideDetail } from "../../../api/api";
import PropertyFields from "../material";
import "../../index.css";
import { css, cx } from "@emotion/css";
import { inject, provide } from "vue";

const normalStyle = css`
  font-size: 14px;
  color: #606266;
  margin-top: -6px;
`;

const useCss = (guideInfo) => {
  if (!guideInfo) return normalStyle;
  if (guideInfo.type == 6) return normalStyle;
  return cx(
    normalStyle,
    css`
      cursor: pointer;
    `
  );
};

const GuideType = {
  1: "关联文档",
  2: "关联文本提示",
  3: "关联图片弹框",
  4: "关联页面图片",
  5: "关联页面",
  6: "不关联",
};

const GuideReaction = {
  1: {
    typeName: "关联文档",
    execute: async function (guideInfo) {
      const fullUrl = await getFullUrl({ url: guideInfo.url });
      window.open(fullUrl, "_blank");
    },
  },
  2: {
    typeName: "关联文本提示",
    execute: function (guideInfo) {
      const dialogInstance = new Vue({
        data() {
          return {
            dialogVisible: true,
          };
        },
        methods: {
          handleClose() {
            document.body.removeChild(this._vnode.elm);
          },
        },
        template: `
          <el-dialog
            custom-class='guide-dialog'
            title="润滑指引"
            :visible.sync="dialogVisible"
            width="20%"
            @close="handleClose">
            <prev style='white-space:pre'>${guideInfo.url}</prev>
          </el-dialog>
        `,
      }).$mount();
      document.body.appendChild(dialogInstance.$el);
    },
  },
  3: {
    typeName: "关联图片弹框",
    execute: async function (guideInfo) {
      const imgURL = await getFullUrl({ url: guideInfo.url });
      const dialogInstance = new Vue({
        data() {
          return {
            dialogVisible: true,
          };
        },
        methods: {
          handleClose() {
            document.body.removeChild(this._vnode.elm);
          },
        },
        template: `
            <el-dialog
              custom-class='guide-dialog'
              :visible.sync="dialogVisible"
              @close="handleClose">
              <img src='${imgURL}' />
            </el-dialog>
          `,
      }).$mount();
      document.body.appendChild(dialogInstance.$el);
    },
  },
  4: {
    typeName: "关联图片弹框",
    execute: async function (guideInfo) {
      const dialogInstance = new Vue({
        data() {
          return {
            dialogVisible: true,
          };
        },
        methods: {
          handleClose() {
            document.body.removeChild(this._vnode.elm);
          },
        },
        template: `
            <el-dialog
              custom-class='guide-dialog'
              :visible.sync="dialogVisible"
              @close="handleClose">
              <img src='${guideInfo.url}' />
            </el-dialog>
          `,
      }).$mount();
      document.body.appendChild(dialogInstance.$el);
    },
  },
  5: {
    typeName: "关联页面",
    execute: function (guideInfo, disabledEditForm) {
      ELEMENT.MessageBox({
        title: "润滑指引",
        message: this.$createElement(GuideLubricationServiceList, {
          props: {
            "guide-list": guideInfo.pageGuideList,
            disabledEditForm,
          },
        }),
        showCancelButton: false,
        showConfirmButton: false,
        beforeClose: (action, instance, done) => {
          done();
        },
      })
        .then()
        .catch();
    },
  },
};

export const GuideNormalTip = Vue.extend({
  props: {
    tipContent: {
      type: String,
      default: "",
    },
  },
  render() {
    return (
      <el-tooltip content={this.tipContent} placement="top">
        <i class="el-icon-info" style="cursor:pointer;margin:0 3px"></i>
      </el-tooltip>
    );
  },
});

export const GuideLubricationServiceTip = Vue.extend({
  props: {
    tipOption: {
      type: Number,
      default: "",
    },
  },
  data() {
    return {
      guideList: [],
      tipInfo: null,
    };
  },
  async created() {
    await this.getSelectGuideList();
    this.findTipInfo();
  },
  methods: {
    findTipInfo() {
      const tipInfo = this.guideList.find((item) => item.id == this.tipOption);
      this.tipInfo = tipInfo;
    },
    async getSelectGuideList() {
      const res = await getGuideList();
      this.guideList = res;
    },
  },
  render() {
    return (
      <div>
        <GuideLubricationService guideInfo={this.tipInfo} />
      </div>
    );
  },
});

export const GuideLubricationService = Vue.extend({
  props: {
    guideInfo: {
      type: Object,
      default: null,
    },
  },
  inject: ["disabledEditForm"],
  methods: {
    viewGuideDetail() {
      if (!this.disabledEditForm) return;
      const { type } = this.guideInfo;
      if (GuideReaction[type]) {
        GuideReaction[type].execute.call(this, this.guideInfo, this.disabledEditForm);
      }
    },
  },
  render() {
    return (
      <div class={useCss(this.guideInfo)} onClick={this.viewGuideDetail}>
        {this.guideInfo && this.guideInfo.name ? (
          <div
            class={css`
              box-sizing: border-box;
              display: flex;
              flex-wrap: wrap;
              color: #001450;
              align-items: center;
            `}
          >
            {this.$attrs.nest ? (
              <div
                class={css`
                  width: 8px;
                  height: 8px;
                  box-sizing: border-box;
                  border-radius: 50%;
                  background-color: #001450;
                  margin-right: 5px;
                `}
              />
            ) : (
              <i class="el-icon-question" style="margin-right:3px;color:#666" />
            )}
            {this.guideInfo.name} <i class="el-icon-arrow-right" style="margin-left:5px" />
            {this.guideInfo.type == 4 && (
              <div
                class={css`
                  width: 100%;
                  position: relative;
                  margin-top: 5px;
                  margin-left: 10px;
                `}
              >
                <img src={this.guideInfo.url} style="width:30%;border-radius: 8px;" />
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  },
});
export const GuideLubricationServiceList = Vue.extend({
  props: {
    guideList: {
      type: Array,
      default: [],
    },
    disabledEditForm: {
      type: Boolean,
      default: false,
    },
  },
  provide() {
    return {
      disabledEditForm: this.disabledEditForm,
    };
  },
  data() {
    return {
      pageGuideList: null,
    };
  },
  created() {
    this.pageGuideList = this.guideList;
  },
  render() {
    return (
      <div>
        {this.pageGuideList && this.pageGuideList.length ? (
          <div>
            {this.pageGuideList.map((item) => {
              return <GuideLubricationService disabledEditForm={this.disabledEditForm} guide-info={item} nest={true} style="margin-bottom: 5px;" />;
            })}
          </div>
        ) : null}
      </div>
    );
  },
});

export const GuideTipProperty = Vue.extendWithMixin({
  data() {
    return {
      iControl: 0,
      guideType: 1,
      guideList: [],
      tipContent: "",
      tipOption: "",
    };
  },
  created() {
    this.getSelectGuideList();
  },
  mounted() {
    this.revertPropertyPanel();
  },
  methods: {
    revertPropertyPanel() {
      if (!this.$attrs.defaultValue) return;
      const { tipType, tipContent, tipOption } = this.$attrs.defaultValue;
      if (tipContent && !tipOption) {
        this.guideType = 1;
        this.iControl = 1;
      } else if (tipOption && !tipContent) {
        this.guideType = 2;
        this.iControl = 1;
      } else if (tipOption && tipContent) {
        this.guideType = 3;
        this.iControl = 1;
      }
      this.tipContent = tipContent;
      this.tipOption = parseInt(tipOption);
    },
    async getSelectGuideList() {
      const res = await getGuideList();
      this.guideList = res;
    },
    changeShowControl(e, type) {
      this[type] = e;
      if (!e) {
        this.tipContent = "";
        this.tipOption = "";
        this.changeFieldConfig("tipContent", "");
        this.changeFieldConfig("tipOption", "");
      }
    },
    changeValue(type, e) {
      if (type == "tipType") {
        this.guideType = e;
        if (this.guideType == 1) {
          this.tipOption = "";
          this.changeFieldConfig("tipOption", "");
        } else if (this.guideType == 2) {
          this.tipContent = "";
          this.changeFieldConfig("tipContent", "");
        }
      }
    },
  },
  render() {
    return (
      <div>
        <PropertyFields.SwitchH defaultValue={this.iControl} fieldName="是否需要提示" pText="是" nText="否" onChangeValue={(e) => this.changeShowControl(e, "iControl")} />
        {this.iControl == 1 && (
          <div>
            <PropertyFields.RadioH
              fieldName="提示类型"
              defaultValue={this.guideType}
              fieldRules={[{ required: true, message: "请选择提示类型", trigger: "blur" }]}
              radioOptions={[
                { value: 1, label: "仅 i 标提示" },
                { value: 2, label: "仅指引提示" },
                { value: 3, label: "双提示" },
              ]}
              onChangeValue={(e) => this.changeValue("tipType", e)}
            />
            {[1, 3].includes(this.guideType) && (
              <PropertyFields.Input
                maxLength={30}
                defaultValue={this.tipContent}
                fieldName="i 标文案"
                fieldRules={[{ required: true, message: "请输入i标文案", trigger: "blur" }]}
                onChangeValue={(e) => this.changeFieldConfig("tipContent", e)}
              />
            )}
            {[2, 3].includes(this.guideType) && (
              <PropertyFields.SelectH
                fieldName="选择指引检查项"
                defaultValue={this.tipOption}
                fieldRules={[{ required: true, message: "请选择指引检查项", trigger: "blur" }]}
                options={this.guideList}
                onChangeValue={(e) => this.changeFieldConfig("tipOption", e ? e.toString() : "")}
              />
            )}
          </div>
        )}
      </div>
    );
  },
});
