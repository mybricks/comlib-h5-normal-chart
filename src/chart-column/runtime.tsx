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
          .slice(0, 10)
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
  ]);

  return (
    <ChartStatus status={status} {...events}>
      <Canvas className={css.chart_line} {...props} />
    </ChartStatus>
  );
}
