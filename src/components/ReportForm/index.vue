<template>
  <div class="custome-table__container">
    <el-button size="small" style="margin-bottom: 10px" @click="resetForm">重置筛选</el-button>
    <el-button size="small" style="float: right" type="danger" @click="createReportForm">新建</el-button>
    <CustomTabale tableHeight="70vh" :tableHeader="tableDataHeader" :tableData="customTableData" @changeSearch="tableInputSearch">
      <template v-slot:woFormType="slotProps">
        <el-table-column :resizable="false" label="报告类型" width="200" show-overflow-tooltip>
          <template slot="header">
            <column-header
              title="报告类型"
              :filterType="slotProps.slotData.filterType"
              :paramValue="slotProps.slotData.paramValue"
              :changeValue="slotProps.slotData.changeValue"
              :selectMultiple="slotProps.slotData.selectMultiple"
              :selectOptions="slotProps.slotData.selectOptions"
              @chSubmit="tableInputSearch"
            />
          </template>
          <template slot-scope="woFormType">
            {{ typeMap[woFormType.row.woFormType] }}
          </template>
        </el-table-column>
      </template>
      <template v-slot:status="slotProps">
        <el-table-column :resizable="false" label="状态" width="200" show-overflow-tooltip>
          <template slot="header">
            <column-header
              title="状态"
              :filterType="slotProps.slotData.filterType"
              :paramValue="slotProps.slotData.paramValue"
              :changeValue="slotProps.slotData.changeValue"
              :selectMultiple="slotProps.slotData.selectMultiple"
              :selectOptions="slotProps.slotData.selectOptions"
              @chSubmit="tableInputSearch"
            />
          </template>
          <template slot-scope="scope">
            {{ scope.row.status == 1 ? "启用" : "禁用" }}
          </template>
        </el-table-column>
      </template>
      <el-table-column :resizable="false" slot="operation" fixed="right" label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-button type="text" size="mini" style="color: #001450" @click="editReportForm(scope.row)">编辑</el-button>
          <el-button :disabled="scope.row.status == 1" type="text" size="mini" style="color: #d10000" @click="deleteReportForm(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </CustomTabale>
    <el-pagination
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="pagenation.current"
      :page-size="pagenation.size"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalNumber"
    />
  </div>
</template>

<script>
import customTable from "../tableComponents/customTable";
import columnHeader from "../tableComponents/headerComponent";
import TableConfigMixin from "./config/customTable.data";
import { updateForm } from "./formApplication/api/api.js";
export default {
  mixins: [TableConfigMixin],
  components: {
    CustomTabale: customTable,
    "column-header": columnHeader,
  },
  data() {
    return {
      customTableData: [],
      pagenation: {
        current: 1,
        size: 30,
      },
      totalNumber: 0,
      searchParams: {
        woFormType: "",
        status: "",
        createName: "",
        createTime: "",
        updateName: "",
        updateTime: "",
      },
      woFormTypeList: [],
      typeMap: {
        1: "循环系统检查报告",
        2: "液压系统检查报告",
        3: "闭式齿轮检查报告",
        4: "轴承检查报告",
        5: "开式齿轮检查报告",
        6: "发动机内窥镜检查报告",
        7: "闭式齿轮内窥镜检查报告",
        8: "设备检查报告",
        9: "油品泄露检查报告",
        10: "故障分析及处理建议书（油品故障-油品泡沫）",
        11: "故障分析及处理建议书（油品故障-油品乳化）",
        12: "故障分析及处理建议书（油品故障-油品污染）",
        13: "故障分析及处理建议书（油品故障-油品颜色变化）",
        14: "故障分析及处理建议书（油品故障-油品黏度超标）",
        15: "故障分析及处理建议书（油品故障-油品高温）",
        16: "故障分析及处理建议书（油品故障-油品沉积物）",
        17: "故障分析及处理建议书（油品故障-油品漆膜）",
        18: "故障分析及处理建议书（油品故障-其它异常或故障）",
        19: "故障分析及处理建议书（设备故障-过滤器堵塞）",
        20: "故障分析及处理建议书（设备故障-液压元件故障）",
        21: "故障分析及处理建议书（设备故障-齿轮异常磨损）",
        22: "故障分析及处理建议书（设备故障-滚动轴承异常磨损）",
        23: "故障分析及处理建议书（设备故障-滚动轴承失效）",
        24: "故障分析及处理建议书（设备故障-供脂系统故障）",
        25: "故障分析及处理建议书（设备故障-其它异常或故障）",
        26: "故障分析及处理建议书（其它故障-其它异常或故障）",
      },
    };
  },
  created() {
    this.getFormList();
    this.getWoFormTypeList();
  },
  methods: {
    async getWoFormTypeList() {
      const res = await this.requestMethodGetTip("wo/formConfig/getWoFormType", {
        current: 1,
        size: 30,
      });
      if (res.data.code == 1000) {
        this.woFormTypeList = res.data.data.list;
        this.tableDataHeader[0].selectOptions = res.data.data.list;
        this.tableDataHeader = this.tableDataHeader.map((item) => item);
      }
    },

    createReportForm() {
      this.$router.push({
        name: "ReportFormCreate",
      });
    },
    editReportForm(row) {
      this.$router.push({
        name: "ReportFormEdit",
        query: {
          woFormId: row.woFormId,
          woFormType: row.woFormType,
          remark: row.remark,
          status: row.status,
        },
      });
    },
    async deleteReportForm(row) {
      try {
        const res = await updateForm({
          ...row,
          woFormId: row.woFormId,
          delFlag: 1,
        });
        if (res.data.code == 1000) {
          this.$message.success("删除成功");
          this.resetForm();
        }
      } catch (e) {
        console.log("this is e", e);
      }
    },
    handleSizeChange(val) {
      this.pagenation.size = val;
      this.getFormList();
    },
    handleCurrentChange(val) {
      this.pagenation.current = val;
      this.getFormList();
    },
    refreshGetFormList() {
      this.pagenation = {
        current: 1,
        size: 30,
      };
      this.getFormList();
    },
    async getFormList() {
      const params = {
        current: this.pagenation.current,
        size: this.pagenation.size,
      };
      Object.keys(this.searchParams).forEach((key) => {
        if (this.searchParams[key] && !["createTime", "updateTime"].includes(key)) {
          params[key] = this.searchParams[key];
        }
        if (this.searchParams.createName) {
          params.createUser = this.searchParams.createName;
        }
        if (this.searchParams.updateName) {
          params.updateUser = this.searchParams.updateName;
        }
      });
      const res = await this.requestMethodGetTip("/wo/form/getFormList", params);
      if (res.data.code == 1000) {
        this.customTableData = res.data.data.list;
        this.totalNumber = res.data.data.totalCount;
      }
    },
    resetForm() {
      this.searchParams = {
        woFormType: "",
        status: "",
        createName: "",
        createTime: "",
        updateName: "",
        updateTime: "",
      };
      this.pagenation = {
        current: 1,
        size: 30,
      };
      this.tableDataHeader.forEach((item) => {
        item.changeValue = "";
      });
      this.refreshGetFormList();
    },
    tableInputSearch(e) {
      this.searchParams[e.paramValue] = e.changeValue;
      if (["updateTime", "createTime"].includes(e.paramValue)) {
        this.searchParams[e.paramValue + "Start"] = e.changeValue[0];
        this.searchParams[e.paramValue + "End"] = e.changeValue[1];
      }
      if (e.paramValue == "status") {
        this.searchParams[e.paramValue] = e.changeValue.toString && e.changeValue.toString();
      }
      const searchHeader = this.tableDataHeader.find((item) => item.paramValue == e.paramValue);
      if (searchHeader) {
        searchHeader.changeValue = e.changeValue;
      }
      this.refreshGetFormList();
    },
  },
};
</script>

<style lang="less" scoped>
.custome-table__container {
  box-sizing: border-box;
  width: 100%;
  padding: 20px;
}
</style>
