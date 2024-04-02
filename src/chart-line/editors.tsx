import { getNormalDataEditors, getLegendEditors, getChartTypeEditors, getGeoEditors } from './../utils/editor'
import { ChartType } from './../types'

export default {
  "@init"({ style }) {
    style.height = 400;
    style.width = '100%';
  },
  "@resize": {
    options: ["width", "height"],
  },
  ":root"({ data, output, style }, cate0, cate1, cate2) {
    cate0.title = "常规";
    cate0.items = [
      getChartTypeEditors({
        options: [
          {
            label: '折线图',
            value: ChartType.Line,
          },
          {
            label: '对比折线图',
            value: ChartType.LineMuti,
          }
        ]
      }),
      getGeoEditors({}),
      getNormalDataEditors({}),
      getLegendEditors({})
    ];

    cate1.title = "样式";
    cate1.items = [];

    cate2.title = "动作";
    cate2.items = [];
  },
};
