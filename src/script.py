import csv
import time
import json
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

# 設定儲存 resume 資訊的檔案名稱
RESUME_FILE = "resume_log.json"
ERROR_LOG_FILE = "error_log.txt"

# 若 resume_log.json 存在則讀取，否則從 0 開始
if os.path.exists(RESUME_FILE):
    with open(RESUME_FILE, "r", encoding="utf-8") as f:
        resume_data = json.load(f)
        start_continent_idx = resume_data.get("continent_index", 0)
        start_country_idx = resume_data.get("country_index", 0)
        start_movie_idx = resume_data.get("movie_index", 0)
else:
    start_continent_idx = 0
    start_country_idx = 0
    start_movie_idx = 0

# 設定 Chrome 選項，例如忽略憑證錯誤
chrome_options = Options()
chrome_options.add_argument("--ignore-certificate-errors")

# 建立 ChromeDriver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
driver.maximize_window()

# 進入主頁 (大洲列表)
driver.get("https://movie-locations.com/places.php")
time.sleep(2)

# 先收集所有大洲連結，避免後續因頁面切換造成 stale element 問題
continent_elements = driver.find_elements(By.XPATH, '//div[@id="multicolumn3"]/p/a')
continents = []
for elem in continent_elements:
    name = elem.text.strip()
    href = elem.get_attribute("href")
    if name and href:
        continents.append((name, href))

# 開啟 CSV 檔 (採用附加模式，確保已寫入資料不會被覆蓋)
csv_filename = "movie_locations.csv"
with open(csv_filename, "a", newline="", encoding="utf-8") as csvfile:
    writer = csv.writer(csvfile)
    # 如果檔案為空則寫入表頭
    if os.stat(csv_filename).st_size == 0:
        writer.writerow(["Continent", "Country", "Movie", "Director", "Locations"])

    try:
        # 逐一處理每個大洲（利用索引，便於後續 resume）
        for ci, (continent_name, continent_href) in enumerate(continents):
            if ci < start_continent_idx:
                continue  # 已處理過的略過

            driver.get(continent_href)
            time.sleep(2)

            # 收集大洲頁中所有國家連結
            country_elements = driver.find_elements(By.XPATH, '//div[@id="multicolumn3"]/p/a')
            countries = []
            for elem in country_elements:
                cname = elem.text.strip()
                chref = elem.get_attribute("href")
                if cname and chref:
                    countries.append((cname, chref))

            for cci, (country_name, country_href) in enumerate(countries):
                if ci == start_continent_idx and cci < start_country_idx:
                    continue

                driver.get(country_href)
                time.sleep(2)

                # 收集國家頁中所有電影項目（可能為 <p>，內含 <a> 或僅文字）
                movie_paragraphs = driver.find_elements(By.XPATH, '//div[@id="multicolumn3"]/p')
                movies = []
                for p_elem in movie_paragraphs:
                    a_elems = p_elem.find_elements(By.TAG_NAME, 'a')
                    if a_elems:
                        m_name = a_elems[0].text.strip()
                        m_href = a_elems[0].get_attribute("href")
                        if m_name and m_href:
                            movies.append((m_name, m_href, True))
                    else:
                        m_name = p_elem.text.strip()
                        if m_name:
                            movies.append((m_name, None, False))

                for mi, (movie_name, movie_href, clickable) in enumerate(movies):
                    if ci == start_continent_idx and cci == start_country_idx and mi < start_movie_idx:
                        continue

                    try:
                        if clickable and movie_href:
                            driver.get(movie_href)
                            time.sleep(4)
                            director = ""
                            locations_list = []

                            # 解析電影詳細頁中的 side bar 資訊
                            # 假設結構在 <div class="creditsnav"> 下，且每個 <ul> 內第一個 <li> 為標籤，第二個 <li> 為資料
                            uls = driver.find_elements(By.XPATH, '//div[@class="creditsnav"]/ul')
                            for ul in uls:
                                li_elems = ul.find_elements(By.TAG_NAME, 'li')
                                if len(li_elems) < 2:
                                    continue
                                label = li_elems[0].text.strip().upper()
                                content_li = li_elems[1]
                                if "DIRECTOR" in label:
                                    a_directors = content_li.find_elements(By.TAG_NAME, 'a')
                                    if a_directors:
                                        director = ", ".join(a.text.strip() for a in a_directors)
                                    else:
                                        director = content_li.text.strip()
                                elif "LOCATIONS" in label:
                                    a_locations = content_li.find_elements(By.TAG_NAME, 'a')
                                    for a in a_locations:
                                        loc_text = a.text.strip()
                                        if loc_text:
                                            locations_list.append(loc_text)
                            locations_str = ", ".join(locations_list)
                            writer.writerow([continent_name, country_name, movie_name, director, locations_str])
                            # 成功處理後更新 resume_log.json，將 movie_index 加 1
                            resume_data = {"continent_index": ci, "country_index": cci, "movie_index": mi + 1}
                            with open(RESUME_FILE, "w", encoding="utf-8") as f:
                                json.dump(resume_data, f)
                            # 回到國家頁面以便處理下一個電影
                            driver.get(country_href)
                            time.sleep(2)
                        else:
                            # 若電影項目無法點進去，僅記錄電影名稱，其餘欄位留空
                            writer.writerow([continent_name, country_name, movie_name, "", ""])
                            resume_data = {"continent_index": ci, "country_index": cci, "movie_index": mi + 1}
                            with open(RESUME_FILE, "w", encoding="utf-8") as f:
                                json.dump(resume_data, f)
                    except Exception as e:
                        # 發生錯誤時，先寫入 error log，再更新 resume_log.json，然後繼續下一筆
                        error_info = {"continent_index": ci, "country_index": cci, "movie_index": mi}
                        with open(ERROR_LOG_FILE, "a", encoding="utf-8") as elog:
                            elog.write(f"Error at {error_info}: {str(e)}\n")
                        with open(RESUME_FILE, "w", encoding="utf-8") as f:
                            json.dump(error_info, f)
                        print(f"Error processing movie '{movie_name}' at indices {error_info}: {e}")
                        continue  # 可選擇跳過該電影，繼續下一個

                # 處理完一個國家後，將 movie resume index 重設為 0，並更新 resume_log.json 至下一個國家
                start_movie_idx = 0
                resume_data = {"continent_index": ci, "country_index": cci + 1, "movie_index": 0}
                with open(RESUME_FILE, "w", encoding="utf-8") as f:
                    json.dump(resume_data, f)
            # 處理完一個大洲後，將國家 resume index 重設為 0，並更新 resume_log.json 至下一個大洲
            start_country_idx = 0
            resume_data = {"continent_index": ci + 1, "country_index": 0, "movie_index": 0}
            with open(RESUME_FILE, "w", encoding="utf-8") as f:
                json.dump(resume_data, f)
    except Exception as e:
        print(f"General error: {e}")
    finally:
        driver.quit()
