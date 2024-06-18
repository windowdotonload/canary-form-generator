export default {
  data() {
    return {
      tableDataHeader: [
        { filterType: "input", paramValue: "orderNumber", changeValue: "", prop: "woFormType", slot: "woFormType", label: "报告类型", width: "180", tooltip: true },
        { label: "描述", width: "200", tooltip: true, prop: "remark" },
        { filterType: "dateRange", paramValue: "companyName", changeValue: "", prop: "status", slot: "status",  label: "状态", width: "180", tooltip: true },
        { filterType: "input", paramValue: "time", changeValue: "", prop: "createName", label: "创建人", width: "130", tooltip: true },
        { filterType: "dateRange", paramValue: "time", changeValue: "", prop: "createTime", label: "创建时间", width: "130", tooltip: true },
        { filterType: "input", paramValue: "time", changeValue: "", prop: "updateName", label: "最后编辑人", width: "130", tooltip: true },
        { filterType: "dateRange", paramValue: "time", changeValue: "", prop: "updateTime", label: "最后编辑时间", width: "130", tooltip: true },
        { slot: "operation", label: "操作" },
      ],
    };
  },
};
