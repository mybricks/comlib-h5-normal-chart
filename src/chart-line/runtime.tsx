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

  const [dataSource, setDataSource] = useState([]);
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
        values: (env.edit ? mockData : dataSource).slice(0, 10).map((d) => d[data.config.xField]),
      };
    }

    chart.source(env.edit ? mockData : dataSource, {
      ...sourceParams
    });

    const { legend } = getChartConfigFromData(data);

    const color = isGroupChart(data.type) ? data.config.seriesField : false;

    chart
      .line()
      .position(`${data.config.xField}*${data.config.yField}`)
      .color(color)
      .shape(data?.geo?.line?.smooth ? "smooth" : "line")
      .animate({
        appear: {
          animation: "groupWaveIn",
        },
      });

    if (data.geo.dot?.show) {
      chart
        .point()
        .position(`${data.config.xField}*${data.config.yField}`)
        .color(color)
        .style({
          stroke: "#fff",
          lineWidth: 1,
        })
        .animate({
          appear: {
            animation: "groupWaveIn",
          },
        });
    }

    if (data.geo.area?.show) {
      chart
        .area()
        .position(`${data.config.xField}*${data.config.yField}`)
        .color(color)
        .animate({
          appear: {
            animation: "groupWaveIn",
          },
        });
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
    data.config?.xFieldScrollable,

    data.geo?.line,
    data.geo?.dot,
    data.geo?.area,
  ]);

  return (
    <ChartStatus status={status} {...events}>
      <Canvas className={css.chart_line} {...props} />
    </ChartStatus>
  );
}
