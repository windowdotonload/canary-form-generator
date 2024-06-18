### 全局注册直接使用 eg：

```html
<el-form-item label="图片：">
  <OSSUploadCombine fileType="knowledge_library" uploadType="image" v-model="field" :limit="3" />
</el-form-item>
<el-form-item label="视频：">
  <OSSUploadCombine fileType="knowledge_library" uploadType="video" v-model="field" />
</el-form-item>
<el-form-item label="附件：">
  <OSSUploadCombine fileType="knowledge_library" uploadType="file" uploadBtnText="上传附件" v-model="field" />
</el-form-item>
```

### Attributes:

| 参数          | 说明                                                                                                      | 类型                         |
| ------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------- |
| v-model       | 同步文件数据，新建绑定空数组[]即可,编辑回显传入半路经组成的数组即可，只读传入全路径或半路经组成的数组均可 | Array< OSSFILE >             |
| uploadType    | Upload 组件上传类型                                                                                       | 'image' ， 'video' ， 'file' |
| fileType      | 上传 OSS 定义的 fileType ,OSS 文件路径相关                                                                | String                       |
| uploadBtnText | 上传文件按钮的文字                                                                                        | String                       |
| limit         | 限制文件上传个数                                                                                          | Number                       |
| fileSizeLimit | 限制上传文件大小                                                                                          | Number                       |
| multiple      | 是否开始多选                                                                                              | Boolean                      |
| width         | 图片，视频预览的宽度                                                                                      | Number                       |
| height        | 图片，视频预览高度                                                                                        | Number                       |
| readOnly      | 仅展示                                                                                                    | Boolean                      |
| accept        | 接受的文件类型                                                                                            | String                       |
| previewAble   | 是否预览文件                                                                                              | Boolean                      |

### OSSFILE:

| 参数        | 说明                 | 类型   |
| ----------- | -------------------- | ------ |
| name        | 文件名               | String |
| url         | 图片展示类型         | String |
| halfPath    | 上传成功后的半路经   | String |
| \_uid       | 文件唯一标识         | Number |
| \_\_fileraw | 文件上传后的原始文件 | File   |
