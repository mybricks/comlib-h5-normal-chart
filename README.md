# mybricks 多端图表组件库 

支持 Vue、React、Taro 等

## 开发环境准备

https://docs.qingque.cn/d/home/eZQB-qPe3ZM4vPXgPHSB9dKJr?identityId=21u4H0zNeFP

### Mybricks 组件开发文档

https://docs.qingque.cn/d/home/eZQASlB9COKIv6egNe1zsnGL3?identityId=21u4H0zNeFP

### 环形进度条 使用样例
```
({ outputs, inputs, logger }) => {
  const [inputValue0] = inputs;
  const [output0] = outputs;
  output0({
    value: 80, config: {
      "color": "#1E90FF",
      "backgroundColor": "#eee",
      "size": 100,
      "strokeWidth": 20,
      isShowLabel: true,
      isShowSubLabel: true,
      labelDistance: 50,
      labelSize: 60,
      labelColor: '#000',
      subLabelSize: 28,
      subLabelColor: 'red',
      label: "10",
      subLabel: "S级",
      // canvasContainerBorder:"solid 1px red"
    }
  });
}
```


