import { requestMethodGet, requestMethodGetTip, requestMethodPostTip } from "@/api/api";
const { ref } = VueCompositionAPI;
const guideList = ref(null);

export const getFullUrl = async (params) => {
  const res = await requestMethodGetTip("/web/file/getFullUrl", params);
  if (res.data.code == 1000) {
    return res.data.data;
  }
  return null;
};

export const getGuideList = async (params) => {
  if (guideList.value) return guideList.value;
  const res = await requestMethodGetTip("lubePoint/study/getGuideList", params);
  if (res.data.code == 1000) {
    res.data.data.forEach((item) => {
      item.label = item.name;
      item.value = item.id;
    });
    guideList.value = res.data.data;
    return guideList.value;
  }
};

export const getGuideDetail = async (params) => {
  return await requestMethodGetTip("/lubePoint/study/getGuideDetail", params /** {id: id} */);
};

export const addForm = async (params) => {
  return await requestMethodPostTip("/wo/form/addForm", params);
};

export const updateForm = async (params) => {
  return await requestMethodPostTip("/wo/form/updateForm", params);
};

export const addFormComponent = async (params) => {
  return await requestMethodPostTip("/wo/form/addFormComponent", params);
};

export const deleteFormComponent = async (params) => {
  return await requestMethodPostTip("/wo/form/deleteFormComponent", params);
};

export const getFormList = async (params) => {
  return await requestMethodGetTip("/wo/form/getFormList", params);
};

export const getFormComponent = async (params) => {
  return await requestMethodGetTip("/wo/form/getFormComponent", params);
};

export const getRecordValue = async (params) => {
  return await requestMethodGetTip("/wo/form/getRecordValue", params);
};

export const getWoFormType = async (params) => {
  return await requestMethodGetTip("wo/formConfig/getWoFormType", params);
};

export const addRecordValue = async (params) => {
  return await requestMethodPostTip("/wo/form/addRecordValue", params);
};

export const queryDevice = async (params) => {
  return await requestMethodGetTip("web/device/queryDevice", params);
};

export const queryLubricationPointDetail = async (params) => {
  return await requestMethodGetTip("web/device/queryLubricationPointDetail", params);
};
