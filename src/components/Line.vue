<template>
  <div class="line" ref="chartDom"></div>
</template>

<script setup>
import * as echarts from "echarts";
import { ref, onMounted } from "vue";

var chartDom = ref(null);
onMounted(() => {
  console.log(chartDom);
  chartDom.value.style.width = "350px";
  chartDom.value.style.height = "400px";

  chartDom.value.style.transform = "translate(10px) scale(0.6)";
  chartDom.value.style.transformOrigin = "0 0";
  var myChart = echarts.init(chartDom.value);
  var option;

  option = {
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: "line",
      },
    ],
  };

  option && myChart.setOption(option);
});
</script>
