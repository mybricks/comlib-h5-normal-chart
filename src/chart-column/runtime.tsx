import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChartStatus, LoadStatus } from "./../components/chart-status";
import { useChart, getChartConfigFromData } from "./../utils/chart";
import { ChartType, isGroupChart } from "./../types";
import css from "./style.less";

export default function ({
  env,
  data,
  inputs,
  outputs,
  title,
  style,
  mockData = [],
}) {
  const { chart, Canvas, events, ...props } = useChart(env);

  const [dataSource, setDataSource] = useState(env.edit ? mockData : []);
  const [status, setStatus] = useState(LoadStatus.IDLE);

  useMemo(() => {
    inputs["loading"]?.((bool) => {
      setStatus(LoadStatus.LOADING);
    });

    inputs["noMore"]?.((bool) => {
      setStatus(LoadStatus.NOMORE);
    });

    inputs["error"]?.((bool) => {
      setStatus(LoadStatus.ERROR);
    });

    inputs["data"]((val) => {
      if (Array.isArray(val)) {
        setDataSource(val);
        setStatus(LoadStatus.IDLE);
      }
    });
  }, []);

  useEffect(() => {
    if (!chart) {
      return;
    }

    chart.clear();

    let sourceParams = {};

    if (data.config.xFieldScrollable) {
      sourceParams[data.config.xField] = {
        values: (env.edit ? mockData : dataSource)
          .slice(0, data.config.xFieldCount || 10)
          .map((d) => d[data.config.xField]),
      };
    }

    chart.source(env.edit ? mockData : dataSource, {
      ...sourceParams,
    });

    // 配置 X 轴标签的旋转角度
    if (data.config.xFieldRotate) {
      chart.axis(data.config.xField, {
        label: function (text, index, total) {
          const cfg = {
            rotate: Math.PI / data.config.xFieldRotate, // 45度
            textAlign: "start",
          };
          return cfg;
        },
      });
    }

    const { legend } = getChartConfigFromData(data);

    const color = isGroupChart(data.type) ? data.config.seriesField : false;

    let adjust: any = null;
    switch (data.type) {
      case ChartType.ColumnStack:
        adjust = "stack";
        break;
      case ChartType.ColumnGroup:
        adjust = {
          type: "dodge",
        };
        break;
    }

    // 定义进度条
    if (data.config.xFieldScrollable) {
      chart.interaction("pan");

      chart.scrollBar({
        mode: "x",
        xStyle: {
          offsetY: -5,
        },
      });
    }

    if (data.config.yFieldDisplay) {
      chart.guide().text({
        position: ["min", "max"], // 位置为 Y 轴的顶部
        content: data.config.yField, // 名称内容
        style: {
          textAlign: "center",
          textBaseline: "bottom",
          fontSize: 12,
          fill: "#808080",
        },
        offsetY: -12, // 向上偏移，避免与 Y 轴的刻度重叠
      });
    }

    chart
      .interval()
      .position(`${data.config.xField}*${data.config.yField}`)
      .color(color)
      .adjust(adjust);

    if (data.useCustomTooltip) {
      // 自定义 tooltip
      chart.tooltip({
        custom: true,
        onShow: (ev) => {
          outputs["onTooltipShow"]?.(ev.items[0]);
        },
        onHide: () => {
          outputs["onTooltipHide"]?.();
        },
      });
    }

    chart.legend(...legend);

    chart.render();
  }, [
    chart,
    mockData,
    dataSource,
    data.type,
    data.config.seriesField,
    data.config.xField,
    data.config.yField,
    data.config?.legend,
    
    data.config.xFieldScrollable,
    data.config.xFieldCount,
    data.config.xFieldRotate,
    data.config.yFieldDisplay
  ]);

  return (
    <ChartStatus status={status} {...events}>
      <Canvas className={css.chart_line} {...props} />
    </ChartStatus>
  );
}
