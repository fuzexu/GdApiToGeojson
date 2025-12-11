# GdApiToGeojson / gdapitogeojson

高德地图 API 数据转换工具，支持将高德地图的路径数据转换为 GeoJSON 和 WKT 格式。

## 功能特性

将高德地图 `PolygonEditor` `mouseTool` 得出的边界路径数据转换为标准 GeoJSON 坐标格式

## 使用

````javascript
npm i gdapitogeojson

import amapPathToWkt from 'gdapitogeojson'

var map = new AMap.Map("container", {
    center: [116.434381, 39.898515],
    zoom: 14
});

// 高德地图 通过多边形编辑器 调整多边形 得出 路径数据

var path = [[116.475334, 39.997534], [116.476627, 39.998315], [116.478603, 39.99879], [116.478529, 40.000296], [116.475082, 40.000151], [116.473421, 39.998717]]

var polygon1 = new AMap.Polygon({
    path: path
})
map.add([polygon1]);
map.setFitView();
    
let polyEditor = new AMap.PolygonEditor(map);
polyEditor.setTarget(polygon1);
polyEditor.open();
polyEditor.on('add', function (data) {
    console.log(data);
    let polygon = data.target;
    let wkt = amapPathToWkt(polygon.getPath())
    console.log(wkt)
})


// 高德地图 通过鼠标工具 绘制多边形 得出路径数据

var mouseTool = new AMap.MouseTool(map)
function drawPolygon () {
    mouseTool.polygon({
    strokeColor: "#FF33FF", 
    strokeOpacity: 1,
    strokeWeight: 6,
    strokeOpacity: 0.2,
    fillColor: '#1791fc',
    fillOpacity: 0.4,
    // 线样式还支持 'dashed'
    strokeStyle: "solid",
    // strokeStyle是dashed时有效
    // strokeDasharray: [30,10],
    })
}
mouseTool.on('draw', function(event) {
    // event.obj 为绘制出来的覆盖物对象
    let polygon = event.obj;
    let wkt = amapPathToWkt(polygon.getPath())
    console.log(wkt)
})
````

## 安装

```bash
# 克隆项目到本地
git clone https://github.com/fuzexu/GdApiToGeojson.git
```

## 致谢

本项目部分代码参考/使用了以下开源项目：

- [Esri/terraformer-wkt-parser](https://github.com/Esri/terraformer-wkt-parser) - 用于 WKT 生成的相关功能 convert
  - 版权: Copyright (c) 2013-2018 Esri, Inc
  - 许可证: MIT

特别感谢这些项目的贡献者们。