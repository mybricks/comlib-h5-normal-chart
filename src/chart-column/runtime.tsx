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

    chart.source(env.edit ? mockData : dataSource);

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

    chart
      .interval()
      .position(`${data.config.xField}*${data.config.yField}`)
      .color(color)
      .adjust(adjust);

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
