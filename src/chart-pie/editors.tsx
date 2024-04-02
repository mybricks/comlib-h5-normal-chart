import { getNormalDataEditors, getLegendEditors } from './../utils/editor'

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
      getNormalDataEditors({}),
      getLegendEditors({})
    ];

    cate1.title = "样式";
    cate1.items = [];

    cate2.title = "动作";
    cate2.items = [];
  },
};
