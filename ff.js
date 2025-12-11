function pointToWKTPoint(primitive) {
    var ret = 'POINT ';

    if (primitive.coordinates === undefined || primitive.coordinates.length === 0) {
        ret += 'EMPTY';

        return ret;
    } else if (primitive.coordinates.length === 3) {
        // 3d or time? default to 3d
        if (primitive.properties && primitive.properties.m === true) {
            ret += 'M ';
        } else {
            ret += 'Z ';
        }
    } else if (primitive.coordinates.length === 4) {
        // 3d and time
        ret += 'ZM ';
    }

    // include coordinates
    ret += '(' + primitive.coordinates.join(' ') + ')';

    return ret;
}
function lineStringToWKTLineString(primitive) {
    var ret = 'LINESTRING ';

    if (primitive.coordinates === undefined || primitive.coordinates.length === 0 || primitive.coordinates[0].length === 0) {
        ret += 'EMPTY';

        return ret;
    } else if (primitive.coordinates[0].length === 3) {
        if (primitive.properties && primitive.properties.m === true) {
            ret += 'M ';
        } else {
            ret += 'Z ';
        }
    } else if (primitive.coordinates[0].length === 4) {
        ret += 'ZM ';
    }

    ret += arrayToRing(primitive.coordinates);

    return ret;
}

function polygonToWKTPolygon(primitive) {
    var ret = 'POLYGON ';

    if (primitive.coordinates === undefined || primitive.coordinates.length === 0 || primitive.coordinates[0].length === 0) {
        ret += 'EMPTY';

        return ret;
    } else if (primitive.coordinates[0][0].length === 3) {
        if (primitive.properties && primitive.properties.m === true) {
            ret += 'M ';
        } else {
            ret += 'Z ';
        }
    } else if (primitive.coordinates[0][0].length === 4) {
        ret += 'ZM ';
    }

    ret += '(';
    var parts = [];
    for (var i = 0; i < primitive.coordinates.length; i++) {
        parts.push(arrayToRing(primitive.coordinates[i]));
    }

    ret += parts.join(', ');
    ret += ')';

    return ret;
}

function multiPointToWKTMultiPoint(primitive) {
    var ret = 'MULTIPOINT ';

    if (primitive.coordinates === undefined || primitive.coordinates.length === 0 || primitive.coordinates[0].length === 0) {
        ret += 'EMPTY';

        return ret;
    } else if (primitive.coordinates[0].length === 3) {
        if (primitive.properties && primitive.properties.m === true) {
            ret += 'M ';
        } else {
            ret += 'Z ';
        }
    } else if (primitive.coordinates[0].length === 4) {
        ret += 'ZM ';
    }

    ret += arrayToRing(primitive.coordinates);

    return ret;
}

function multiLineStringToWKTMultiLineString(primitive) {
    var ret = 'MULTILINESTRING ';

    if (primitive.coordinates === undefined || primitive.coordinates.length === 0 || primitive.coordinates[0].length === 0) {
        ret += 'EMPTY';

        return ret;
    } else if (primitive.coordinates[0][0].length === 3) {
        if (primitive.properties && primitive.properties.m === true) {
            ret += 'M ';
        } else {
            ret += 'Z ';
        }
    } else if (primitive.coordinates[0][0].length === 4) {
        ret += 'ZM ';
    }

    ret += '(';
    var parts = [];
    for (var i = 0; i < primitive.coordinates.length; i++) {
        parts.push(arrayToRing(primitive.coordinates[i]));
    }

    ret += parts.join(', ');
    ret += ')';

    return ret;
}

function multiPolygonToWKTMultiPolygon(primitive) {
    var ret = 'MULTIPOLYGON ';

    if (primitive.coordinates === undefined || primitive.coordinates.length === 0 || primitive.coordinates[0].length === 0 || primitive.coordinates[0][0].length === 0) {
        ret += 'EMPTY';

        return ret;
    } else if (primitive.coordinates[0][0][0].length === 3) {
        if (primitive.properties && primitive.properties.m === true) {
            ret += 'M ';
        } else {
            ret += 'Z ';
        }
    } else if (primitive.coordinates[0][0][0].length === 4) {
        ret += 'ZM ';
    }

    ret += '(';
    var inner = [];
    for (var c = 0; c < primitive.coordinates.length; c++) {
        var it = '(';
        var parts = [];
        for (var i = 0; i < primitive.coordinates[c].length; i++) {
            parts.push(arrayToRing(primitive.coordinates[c][i]));
        }

        it += parts.join(', ');
        it += ')';

        inner.push(it);
    }

    ret += inner.join(', ');
    ret += ')';

    return ret;
}

function arrayToRing(arr) {
    var parts = [], ret = '';

    for (var i = 0; i < arr.length; i++) {
        parts.push(arr[i].join(' '));
    }

    ret += '(' + parts.join(', ') + ')';

    return ret;

}

function convert(primitive) {
    switch (primitive.type) {
        case 'Point':
            return pointToWKTPoint(primitive);
        case 'LineString':
            return lineStringToWKTLineString(primitive);
        case 'Polygon':
            return polygonToWKTPolygon(primitive);
        case 'MultiPoint':
            return multiPointToWKTMultiPoint(primitive);
        case 'MultiLineString':
            return multiLineStringToWKTMultiLineString(primitive);
        case 'MultiPolygon':
            return multiPolygonToWKTMultiPolygon(primitive);
        case 'GeometryCollection':
            var ret = 'GEOMETRYCOLLECTION';
            var parts = [];
            for (i = 0; i < primitive.geometries.length; i++) {
                parts.push(convert(primitive.geometries[i]));
            }
            return ret + '(' + parts.join(', ') + ')';
        default:
            throw Error("Unknown Type: " + primitive.type);
    }
}

/**
 * 将 AMap 的 path（AMap.LngLat[] 或 嵌套数组）转换为 GeoJSON 坐标数组（用于 WKT 转换）
 * @param {Array} path - 可能是 [AMap.LngLat,...] 或 [[lng,lat],...] 或 多环/多面结构
 * @returns {Array} 归一化后的坐标结构（可能是单环或多环）
 */
function amapPathToGeoJSONCoords(path) {
    if (!Array.isArray(path)) return [];

    // 情形 A: 一环，元素为对象 {lng, lat}
    if (path.length > 0 && typeof path[0] === "object" && "lng" in path[0] && "lat" in path[0]) {
        return path.map((pt) => [Number(pt.lng), Number(pt.lat)]);
    }

    // 情形 B: 已经是 [ [lng,lat], ... ] 一环
    if (path.length > 0 && Array.isArray(path[0]) && typeof path[0][0] === "number") {
        return path.map((pt) => [Number(pt[0]), Number(pt[1])]);
    }

    // 情形 C: 多环 / 多面（递归处理）
    return path.map((item) => amapPathToGeoJSONCoords(item));
}

/**
 * 将 AMap path 转为 WKT 字符串（POLYGON 或 MULTIPOLYGON）
 * @param {Array} path - AMap path（可为 AMap.LngLat[]、[[lng,lat],...]、或嵌套多环结构）
 * @returns {string} WKT 字符串（如 POLYGON((...)) 或 MULTIPOLYGON((...))）
 */
function amapPathToWkt(path) {
    const coords = amapPathToGeoJSONCoords(path);

    // If coords is a 1-ring [ [lng,lat], ... ] -> wrap to [ [ [lng,lat]... ] ]
    let fixedCoords = coords;
    if (
        Array.isArray(coords) &&
        coords.length > 0 &&
        Array.isArray(coords[0]) &&
        typeof coords[0][0] === "number"
    ) {
        fixedCoords = [coords];
    }

    let geojson = null;
    // Polygon: [ [ [lng,lat], ... ] ]
    if (
        Array.isArray(fixedCoords) &&
        Array.isArray(fixedCoords[0]) &&
        Array.isArray(fixedCoords[0][0]) &&
        typeof fixedCoords[0][0][0] === "number"
    ) {
        geojson = { type: "Polygon", coordinates: fixedCoords };
    }
    // MultiPolygon: [ [ [ [lng,lat], ... ] ], ... ]
    else if (
        Array.isArray(fixedCoords) &&
        Array.isArray(fixedCoords[0]) &&
        Array.isArray(fixedCoords[0][0]) &&
        Array.isArray(fixedCoords[0][0][0]) &&
        typeof fixedCoords[0][0][0][0] === "number"
    ) {
        geojson = { type: "MultiPolygon", coordinates: fixedCoords };
    } else {
        // 尝试更宽容的处理：如果是空或未知结构，抛错或返回空字符串
        throw new Error("amapPathToWkt: 未知的多边形结构，无法转换为 WKT");
    }

    // Ensure polygon rings are closed: 首尾相同则为闭合环，否则复制首坐标到尾部
    if (geojson && geojson.coordinates) {
        if (geojson.type === "Polygon") {
            geojson.coordinates = geojson.coordinates.map((ring) => {
                if (!Array.isArray(ring) || ring.length === 0) return ring;
                const first = ring[0];
                const last = ring[ring.length - 1];
                if (first[0] !== last[0] || first[1] !== last[1]) {
                    return [...ring, [first[0], first[1]]];
                }
                return ring;
            });
        } else if (geojson.type === "MultiPolygon") {
            geojson.coordinates = geojson.coordinates.map((polygon) =>
                polygon.map((ring) => {
                    if (!Array.isArray(ring) || ring.length === 0) return ring;
                    const first = ring[0];
                    const last = ring[ring.length - 1];
                    if (first[0] !== last[0] || first[1] !== last[1]) {
                        return [...ring, [first[0], first[1]]];
                    }
                    return ring;
                })
            );
        }
    }

    return convert(geojson);
}

module.exports = { 
  amapPathToWkt,
  convert,
};