<template>
  <div class="custome-table__container">
    <el-button size="small" style="margin-bottom: 10px">重置筛选</el-button>
    <el-button size="small" style="float: right" type="danger" @click="createReportForm">新建</el-button>
    <CustomTabale :tableHeader="tableDataHeader" :tableData="customTableData">
      <el-table-column :resizable="false" slot="woFormType" label="报告类型" width="200">
        <template slot-scope="woFormType">
          {{ typeMap[woFormType.row.woFormType] }}
        </template>
      </el-table-column>
      <el-table-column :resizable="false" slot="status" label="状态" width="200">
        <template slot-scope="scope">
          {{ scope.row.status == 1 ? "启用" : "禁用" }}
        </template>
      </el-table-column>
      <el-table-column :resizable="false" slot="operation" fixed="right" label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-button type="text" size="mini" style="color: #001450" @click="editReportForm(scope.row)">编辑</el-button>
          <el-button type="text" size="mini" style="color: #d10000" @click="deleteReportForm(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </CustomTabale>
  </div>
</template>

<script>
import customTable from "../tableComponents/customTable";
import TableConfigMixin from "./config/customTable.data";
export default {
  mixins: [TableConfigMixin],
  components: {
    CustomTabale: customTable,
  },
  data() {
    return {
      customTableData: [],
      typeMap: {
        1: "循环系统检查报告",
        2: "液压系统检查报告",
        3: "闭式齿轮检查报告",
        4: "轴承检查报告",
        5: "开式齿轮检查报告",
        6: "发动机内窥镜检查报告",
        7: "闭式齿轮内窥镜检查报告",
        8: "故障分析及处理建议书",
        9: "设备检查报告",
        10: "油品泄露检查报告",
      },
    };
  },
  created() {
    this.getFormList();
  },
  methods: {
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
    deleteReportForm(row) {
      this.$router.push({
        name: "ReportFormFillReport",
        query: {
          woFormId: row.woFormId,
        },
      });
    },
    async getFormList() {
      const params = {
        current: 1,
        size: 30,
      };
      const res = await this.requestMethodGetTip("/wo/form/getFormList", params);
      if (res.data.code == 1000) {
        this.customTableData = res.data.data.list;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.custome-table__container {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 20px;
}
</style>
