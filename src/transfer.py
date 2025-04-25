import csv
import os

input_file = "movie_locations.csv"
output_file = "movie_locations_cleaned.csv"

with open(input_file, "r", encoding="utf-8") as infile, \
     open(output_file, "w", newline="", encoding="utf-8") as outfile:
    
    reader = csv.DictReader(infile)
    # 過濾掉 fieldnames 中為 None 的欄位
    fieldnames = [fn for fn in reader.fieldnames if fn is not None]
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    
    writer.writeheader()
    for row in reader:
        # 移除 row 中 key 為 None 或不在預期 fieldnames 裡的項目
        row = {k: v for k, v in row.items() if k in fieldnames}
        
        # 檢查 Movie 欄位，若內容為 "no film listed"（忽略大小寫與前後空白）則跳過此筆資料
        if row.get("Movie", "").strip().upper() == "NO FILMS CURRENTLY LISTED":
            continue
        
        # 將 Continent 與 Country 欄位轉換成首字母大寫其他小寫
        if "Continent" in row:
            row["Continent"] = row["Continent"].strip().capitalize()
        if "Country" in row:
            row["Country"] = row["Country"].strip().capitalize()
        
        writer.writerow(row)

print("處理完成，已儲存至", output_file)
