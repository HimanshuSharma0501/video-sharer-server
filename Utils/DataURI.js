import DataURIParser from "datauri/parser.js";
import path from "path";
const getDataURI = (file) => {
  const parser = new DataURIParser();
  const extName = path.extname(String(file.orignalname));
  console.log(extName);
  return parser.format(extName, file.buffer);
};
export default getDataURI;
