import { oss_client } from "../../utils/ossClient";
import { fullScreen_loading } from "@/generalComponents/fullScreenLoading";
import { requestMethodGetTip } from "../../api/api";
import { cloneDeep } from "lodash";

export const HttpOrHttpsReg = /(http|https)/;

export const _uuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const initAssetsArr = async (existsPaths) => {
  const Paths = cloneDeep(existsPaths);
  if (Paths.length == 0 || Paths.every((item) => !item)) return [];

  const fullPathFlag = HttpOrHttpsReg.test(Paths[0]);
  if (fullPathFlag) {
    return Paths.map((path) => ({
      name: path,
      url: path,
      halfPath: "",
      _uid: new Date().getTime() + _uuid(),
    }));
  }
  const res = await getFullPathBatch(Paths);
  const fullPaths = res.map((item) => item.data.data);

  return Paths.map((halfPath, index) => {
    if (typeof halfPath == "object") return halfPath;
    return {
      name: halfPath.split("/")[halfPath.split("/").length - 1],
      url: fullPaths[index],
      halfPath,
      _uid: new Date().getTime() + _uuid(),
    };
  });
};

export const getFullPath = async (path) => {
  return await requestMethodGetTip("/web/file/getFullUrl", {
    url: encodeURI(path),
  });
};

export const getFullPathBatch = async (paths) => {
  const reqs = paths.map((path) => getFullPath(path));
  return Promise.all(reqs);
};

export const oss_uploadFile = async (file, name, fileType, needLoading = true) => {
  if (needLoading) fullScreen_loading.LOADING();
  await oss_client.getOSSClientInstance(fileType);
  const uploadFileRes = await oss_client.uploadFile(file, name);
  if (needLoading) fullScreen_loading.ENDLOADING();
  if (!uploadFileRes || !uploadFileRes.name) {
    this.$message({
      type: "warning",
      message: "文件上传失败，请稍后重试。",
    });
  }
  return uploadFileRes;
};
