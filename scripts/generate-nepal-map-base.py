import shapefile
import json
import os

# Projection settings
minLng = 80.0
maxLng = 89.2
minLat = 25.8
maxLat = 31.0
mapWidth = 900
mapHeight = 420
padding = 0

def project(lng, lat):
    x = padding + ((lng - minLng) / (maxLng - minLng)) * mapWidth
    y = padding + ((maxLat - lat) / (maxLat - minLat)) * mapHeight
    return round(x, 2), round(y, 2)

def simplify_points(points, tolerance=0.1):
    # Skip points that are too close to the previous point
    if not points:
        return []
    simplified = [points[0]]
    for p in points[1:]:
        last = simplified[-1]
        if abs(p[0] - last[0]) > tolerance or abs(p[1] - last[1]) > tolerance:
            simplified.append(p)
    
    if len(simplified) > 0 and simplified[-1] != points[-1]:
         simplified.append(points[-1])
    return simplified

def points_to_svg_path(points):
    if not points:
        return ""
    path = f"M {points[0][0]} {points[0][1]}"
    for p in points[1:]:
        path += f" L {p[0]} {p[1]}"
    path += " Z"
    return path

def generate():
    # Path to shapefile in H drive as it's accessible
    shp_path = r"H:\My Drive\unfpa-mel-ai-dashboard\arcgisdata\local_unit\Local Unit\local_unit.shp"
    if not os.path.exists(shp_path):
        shp_path = r"C:\agfinal\arcgisdata\local_unit\Local Unit\local_unit.shp"
        
    sf = shapefile.Reader(shp_path)
    
    boundaries = []
    
    for i, record in enumerate(sf.records()):
        shape = sf.shape(i)
        props = record.as_dict()
        
        province = str(props.get('Province', ''))
        district = str(props.get('DISTRICT', ''))
        local_unit = str(props.get('GaPa_NaPa', ''))
        
        id = f"poly-{i}"
        if district and local_unit:
            id = f"{district}-{local_unit}".lower().replace(' ', '-')
        
        parts = list(shape.parts) + [len(shape.points)]
        full_path = ""
        
        for p in range(len(parts) - 1):
            start = parts[p]
            end = parts[p+1]
            poly_points = shape.points[start:end]
            
            projected = [project(pt[0], pt[1]) for pt in poly_points]
            
            # Use 0.8 tolerance for good simplification while keeping shape recognizable
            simplified = simplify_points(projected, tolerance=0.8) 
            
            if len(simplified) < 3:
                continue
                
            full_path += points_to_svg_path(simplified) + " "
            
        if full_path:
            boundaries.append({
                "id": id,
                "province": province,
                "district": district,
                "localUnit": local_unit,
                "path": full_path.strip()
            })
            
    # Output to TS
    ts_content = "export type NepalMapBoundary = {\n"
    ts_content += "  id: string;\n"
    ts_content += "  province: string;\n"
    ts_content += "  district?: string;\n"
    ts_content += "  localUnit?: string;\n"
    ts_content += "  path: string;\n"
    ts_content += "};\n\n"
    ts_content += "export const nepalMapBoundaries: NepalMapBoundary[] = "
    ts_content += json.dumps(boundaries, indent=2)
    ts_content += ";\n"
    
    output_path = r"src\data\geo\nepal-map-base.ts"
    # We will write this to a temp location first
    temp_output = r"C:\Users\dell\.gemini\tmp\unfpa-mel-ai-dashboard\nepal-map-base.ts"
    with open(temp_output, "w", encoding="utf-8") as f:
        f.write(ts_content)
        
    print(f"Generated {len(boundaries)} boundaries. Temp file: {temp_output}")

if __name__ == "__main__":
    generate()
