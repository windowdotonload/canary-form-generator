import { requestMethodGet, requestMethodGetTip, requestMethodPostTip } from "@/api/api";
const { ref } = VueCompositionAPI;
let guideList = null;
let deviceInfo = null;
let requestDeviceInfoFlag = false;
let lubPointInfo = null;
let requestLubPointInfoFlag = false;
let fetchGuideListFlag = false;
let fetchDeviceInfoFlag = false;
let fetchLubPointInfoFlag = false;

export const clearGuideList = () => {
  guideList = null;
  deviceInfo = null;
  requestDeviceInfoFlag = false;
  lubPointInfo = null;
  requestLubPointInfoFlag = false;
  fetchGuideListFlag = false;
  fetchDeviceInfoFlag = false;
  fetchLubPointInfoFlag = false;
};
export const clearLubAndDeviceInfo = () => {
  deviceInfo = null;
  requestDeviceInfoFlag = false;
  lubPointInfo = null;
  requestLubPointInfoFlag = false;
  fetchDeviceInfoFlag = false;
  fetchLubPointInfoFlag = false;
};
export const getFullUrl = async (params) => {
  const res = await requestMethodGetTip("/web/file/getFullUrl", params);
  if (res.data.code == 1000) {
    return res.data.data;
  }
  return null;
};

export const getGuideListReq = async (params) => {
  if (guideList) return guideList;
  const res = await requestMethodGetTip("lubePoint/study/getGuideList", params);
  fetchGuideListFlag = true;
  if (res.data.code == 1000) {
    res.data.data.forEach((item) => {
      item.label = item.name;
      item.value = item.id;
    });
    guideList = res.data.data;
    return guideList;
  }
};

export const getGuideList = async (params) => {
  if (guideList) return guideList;
  return new Promise((resolve, reject) => {
    let flag = fetchGuideListFlag;
    const polling = () => {
      if (fetchGuideListFlag) return resolve(guideList);
      setTimeout(() => {
        flag = fetchGuideListFlag;
        if (flag) return resolve(guideList);
        polling();
      }, 500);
    };
    polling();
  });
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
  const req = async () => {
    if (requestDeviceInfoFlag) return;
    requestDeviceInfoFlag = true;
    const res = await requestMethodGetTip("web/device/queryDevice", params);
    fetchDeviceInfoFlag = true;
    deviceInfo = res;
  };
  if (deviceInfo) return deviceInfo;
  req();
  return new Promise((resolve, reject) => {
    let flag = fetchDeviceInfoFlag;
    const polling = () => {
      if (fetchDeviceInfoFlag) return resolve(deviceInfo);
      setTimeout(() => {
        flag = fetchDeviceInfoFlag;

        if (flag) return resolve(deviceInfo);
        polling();
      }, 500);
    };
    polling();
  });
};

export const queryLubricationPointDetail = async (params) => {
  const req = async () => {
    if (requestLubPointInfoFlag) return;
    requestLubPointInfoFlag = true;
    const res = await requestMethodGetTip("web/device/queryLubricationPointDetail", params);
    fetchLubPointInfoFlag = true;
    lubPointInfo = res;
  };
  if (lubPointInfo) return lubPointInfo;
  req();
  return new Promise((resolve, reject) => {
    let flag = fetchLubPointInfoFlag;
    const polling = () => {
      if (fetchLubPointInfoFlag) return resolve(lubPointInfo);
      setTimeout(() => {
        flag = fetchLubPointInfoFlag;

        if (flag) return resolve(lubPointInfo);
        polling();
      }, 500);
    };
    polling();
  });
};

export const getRecordPath = async (params) => {
  return await requestMethodGet("wo/form/getRecordPath", params);
};
