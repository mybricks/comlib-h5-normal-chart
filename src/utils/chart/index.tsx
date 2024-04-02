import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Canvas as TaroCanvas } from "@tarojs/components";
import * as Taro from "@tarojs/taro";
import F2 from '@antv/f2';

export * from './config';

const getCanvasInTaro = async (id) => {
  return new Promise((resolve, reject) => {
    Taro.createSelectorQuery().select(`#${id}`)
    .fields({
      node: true,
      size: true,
    })
    .exec((res) => {
      const { width, height } = res[0];
      const canvas = res[0].node;

      const pixelRatio = Taro.getSystemInfoSync().pixelRatio;

      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      resolve({
        context: canvas.getContext("2d"),
        pixelRatio,
        width,
        height,
      })
    })
  })

  
}

const getCanvasInDesn = async (el: HTMLElement) => {
  const { width, height } = el.getBoundingClientRect();
  return Promise.resolve({
    el,
    width,
    height
  })
}

export const useChart = (env) => {
  const chartEl = useRef<HTMLElement>(null)

  const canvasEl = useRef(null);
  const [chart, setChart] = useState<any>(null);

  const chartId = useRef(uuid());

  useEffect(() => {
    let _chart = {
      ref: {}
    }

    ;(async() => {
      const options = await (isDesigner(env) ? getCanvasInDesn(chartEl.current) : getCanvasInTaro(chartId.current));
      _chart.ref = new F2.Chart(options)

      if (!_chart.ref) {
        return
      }

      canvasEl.current = _chart.ref.get('el');
      setChart(_chart.ref)
    })();


    return () => {
      _chart.ref?.destroy?.();
    }
  }, []);

  const Canvas = useCallback((props) => {
    if (isDesigner(env)) {
      return <canvas ref={chartEl} {...props} />
    }
    return <TaroCanvas {...props} />
  }, [])

  const handleEvent = useCallback((type) => {
    return isDesigner(env) ? e => {} : e => canvasEl.current?.dispatchEvent(type, wrapEvent(e))
  }, [])

  return {
    chart,
    id: chartId.current,
    type: '2d',
    Canvas,
    onClick: handleEvent('click'),
    onTouchStart: handleEvent('touchstart'),
    onTouchMove: handleEvent('touchmove'),
    onTouchEnd: handleEvent('touchend'),
  }
}


function wrapEvent(e: any) {
  if (!e) return
  if (!e.preventDefault) {
    e.preventDefault = function () { }
  }
  return e
}

function uuid(pre = 'c_', len = 6) {
  const seed = 'abcdefhijkmnprstwxyz0123456789',
    maxPos = seed.length;
  let rtn = '';
  for (let i = 0; i < len; i++) {
    rtn += seed.charAt(Math.floor(Math.random() * maxPos));
  }
  return pre + rtn;
}


function isDesigner(env): Boolean {
  if (env?.edit || env?.runtime?.debug) {
    return true;
  } else {
    return false;
  }
}