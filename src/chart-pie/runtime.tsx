import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChartStatus, LoadStatus } from "./../components/chart-status";
import { useChart } from "./../utils/chart";
import { ChartType, isGroupChart } from './../types'
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

    let _data: any[] = env.edit ? mockData : dataSource;

    if (data.type === ChartType.Pie) {
      // const total = _data.reduce((a, c) => a + c?.[data.config.yField], 0)
      _data = _data.map(item => {
        return {
          ...item,
          total: 'const',
        }
      })
    }

    chart.source(_data);
    
    chart.tooltip(false);
    if (data.type === ChartType.Circle) {
      chart.coord('polar', {
        transposed: true,
        innerRadius: data.innerRadius ?? 0.7,
        radius: data.radius ?? 1
      });
    } else if (data.type === ChartType.Pie) {
      chart.coord('polar', {
        transposed: true,
        radius: data.radius ?? 1
      });
    }
    
    chart.axis(false);

    chart
      .interval()
      .position(`total*${data.config.yField}`)
      .color(data.config.xField)
      .adjust('stack')
      .style({
        lineWidth: 1,
        stroke: '#fff',
        lineJoin: 'round',
        lineCap: 'round'
      })
      .animate({
        appear: {
          duration: 1200,
          easing: 'bounceOut'
        }
      });

    if (data.guide?.open && data.type === ChartType.Circle) {
      chart.guide().text({
        position: ['50%', '46%'],
        content: data.guide?.title,
        style: {
          fontSize: 13,
          textAlign: 'center',
          fill: '#8C8C8C',
        }
      })
      chart.guide().text({
        position: ['50%', '54%'],
        content: 300,
        style: {
          fontSize: 24,
          textAlign: 'center',
          fontWeight: 500,
          fill: '#1F1F1F',
        }
      })
    }

    const legendConfig = getLegendFromData(data.config?.legend)
    if (!legendConfig) {
      chart.legend(false);
    } else {
      chart.legend(data.config.xField, legendConfig);
    }

    chart.render();
  }, [chart, dataSource, data.type, data.radius, data.innerRadius, data.config.xField, data.config.yField, data.config?.legend, data.guide, data.guide?.open, data.guide?.title]);

  return (
    <ChartStatus status={status} {...events}>
      <Canvas className={css.chart_line} {...props} />
    </ChartStatus>
  );
}

function getColorFromData(config) {

}

function getLegendFromData(legendConfig) {
  if (!legendConfig) {
    return false;
  }

  let result = {}
  let posParams = {};

  if (legendConfig.position) {
    switch (legendConfig.position) {
      case "top-left":
        posParams = {
          position: "top",
          align: "left",
        };
        break;
      case "top":
        posParams = {
          position: "top",
          align: "center",
        };
        break;
      case "top-right":
        posParams = {
          position: "top",
          align: "right",
        };
        break;
      case "bottom-left":
        posParams = {
          position: "bottom",
          align: "left",
        };
        break;
      case "bottom":
        posParams = {
          position: "bottom",
          align: "center",
        };
        break;
      case "bottom-right":
        posParams = {
          position: "bottom",
          align: "right",
        };
        break;
      default:
        posParams = {
          position: legendConfig.position
        }
        break;
    }
  }

  return { ...result, ...posParams }
}
