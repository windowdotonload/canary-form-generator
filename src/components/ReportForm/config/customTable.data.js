export default {
  data() {
    return {
      tableDataHeader: [
        { filterType: "selection", paramValue: "woFormType", changeValue: "", prop: "woFormType", slot: "woFormType", label: "报告类型", width: "180", tooltip: true, selectOptions: [] },
        { label: "描述", width: "200", tooltip: true, prop: "remark" },
        {
          filterType: "selection",
          paramValue: "status",
          changeValue: "",
          prop: "status",
          slot: "status",
          label: "状态",
          width: "180",
          tooltip: true,
          selectOptions: [
            { code: 0, name: "禁用" },
            { code: 1, name: "启用" },
          ],
        },
        { filterType: "input", paramValue: "createName", changeValue: "", prop: "createName", label: "创建人", width: "130", tooltip: true },
        { filterType: "dateRange", paramValue: "createTime", changeValue: "", prop: "createTime", label: "创建时间", width: "130", tooltip: true },
        { filterType: "input", paramValue: "updateName", changeValue: "", prop: "updateName", label: "最后编辑人", width: "130", tooltip: true },
        { filterType: "dateRange", paramValue: "updateTime", changeValue: "", prop: "updateTime", label: "最后编辑时间", width: "130", tooltip: true },
        { slot: "operation", label: "操作" },
      ],
    };
  },
};
