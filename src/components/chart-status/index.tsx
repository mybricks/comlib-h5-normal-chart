import React, { useEffect, useState } from "react";
import { View } from "@tarojs/components";
import css from "./index.less";

const Empty = () => {
  return <View className={css.chart_wrap_empty}>暂无数据</View>;
};

const Loading = () => {
  return <View className={css.chart_wrap_loading}>加载中</View>;
};

export const ChartStatus = ({
  className,
  children,
  status = LoadStatus.IDLE,
}: {
  className?;
  children?;
  status?;
}) => {
  return (
    <View className={`${css.chart_wrap} ${className}`}>
      {status === LoadStatus.LOADING && <Loading />}
      {status === LoadStatus.NOMORE && <Empty />}
      {children}
    </View>
  );
};

export enum LoadStatus {
  IDLE = "idle",
  LOADING = "loading",
  ERROR = "error",
  NOMORE = "noMore",
}

export default ChartStatus;
