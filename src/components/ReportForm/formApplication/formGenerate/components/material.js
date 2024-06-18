const BASECOMP = {};
const comp = require.context("./baseComp", true, /\.js$/);
comp.keys().forEach((File) => {
  const componentName = File.substring(File.lastIndexOf("/") + 1, File.lastIndexOf("."));
  BASECOMP[componentName] = comp(File)[componentName];
});
export default BASECOMP;
