export { GroupModuleProperty } from "./GroupModuleProperty";
export { TabBarProperty } from "./TabBarProperty";
import { menuData } from "../iconMenu/config.js";
const PROPERTY = {};
const comp = require.context("../baseComp", true, /\.js$/);
comp.keys().forEach((File) => {
  const baseCompName = File.substring(File.lastIndexOf("/") + 1, File.lastIndexOf("."));
  const compInfo = menuData[0].subMenuData.find((comp) => comp.componentName == baseCompName);
  const propertyName = compInfo ? compInfo.propertyPanelComponent : "";
  if (propertyName) PROPERTY[propertyName] = comp(File)[propertyName];
});
export default PROPERTY;
