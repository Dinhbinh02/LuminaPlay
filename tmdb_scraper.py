import asyncio
import os
import httpx
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from tqdm.asyncio import tqdm

# --- CẤU HÌNH ---
SITEMAP_URL = "https://developer.themoviedb.org/sitemap.xml"
OUTPUT_DIR = "tmdb_docs"
CONCURRENT_TASKS = 5  # Số lượng trang xử lý cùng lúc (tránh bị block)

async def get_all_urls():
    """Lấy danh sách tất cả các URL từ sitemap."""
    print(f"[*] Đang tải sitemap từ {SITEMAP_URL}...")
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(SITEMAP_URL)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'xml')
            urls = [loc.text for loc in soup.find_all('loc')]
            
            # Lọc chỉ lấy các trang trong docs và reference
            filtered_urls = [url for url in urls if "/docs/" in url or "/reference/" in url]
            print(f"[*] Tìm thấy {len(filtered_urls)} trang cần cào.")
            return filtered_urls
    except Exception as e:
        print(f"[!] Lỗi khi lấy sitemap: {e}")
        return []

async def scrape_page(browser, url, pbar):
    """Truy cập trang, nhấn nút 'Copy Page' và lưu nội dung."""
    page = await browser.new_page()
    content_captured = asyncio.Future()

    # Override navigator.clipboard.writeText để bắt nội dung Markdown trực tiếp từ trình duyệt
    await page.add_init_script("""
        navigator.clipboard.writeText = (text) => {
            window.onMarkdownCaptured(text);
            return Promise.resolve();
        };
    """)

    # Đăng ký hàm callback để nhận dữ liệu từ JavaScript bên trong trang
    await page.expose_function("onMarkdownCaptured", lambda t: content_captured.set_result(t) if not content_captured.done() else None)

    try:
        # Tăng timeout vì một số trang reference khá nặng
        await page.goto(url, wait_until="domcontentloaded", timeout=60000)
        
        # Đợi nút "Copy Page" xuất hiện
        # Nút này nằm trong phần header của nội dung
        copy_button = page.get_by_role("button", name="Copy Page")
        
        # Đợi một chút cho các thành phần JS load xong
        await asyncio.sleep(1) 

        if await copy_button.is_visible():
            await copy_button.click()
            
            # Đợi bắt được nội dung (tối đa 15s)
            try:
                markdown_text = await asyncio.wait_for(content_captured, timeout=15.0)
                
                # Tạo đường dẫn lưu file dựa trên URL
                # VD: .../docs/getting-started -> tmdb_docs/docs/getting-started.md
                relative_path = url.split("themoviedb.org/")[1]
                file_path = os.path.join(OUTPUT_DIR, relative_path) + ".md"
                
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(markdown_text)
            except asyncio.TimeoutError:
                # Nếu không bắt được qua clipboard, thử lấy trực tiếp nội dung chính (backup plan)
                pass 
        else:
            # Nếu không có nút Copy (hiếm khi xảy ra), có thể lấy nội dung thô bằng cách khác ở đây
            pass

    except Exception as e:
        # Ghi log lỗi vào file nếu cần
        pass
    finally:
        await page.close()
        pbar.update(1)

async def main():
    with open('urls.txt') as f: urls = [line.strip() for line in f if line.strip()]
    if not urls:
        return

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    async with async_playwright() as p:
        # Chạy ở chế độ headless (không mở cửa sổ trình duyệt)
        browser = await p.chromium.launch(headless=True)
        
        # Sử dụng semaphore để giới hạn số lượng tab mở cùng lúc
        semaphore = asyncio.Semaphore(CONCURRENT_TASKS)
        
        pbar = tqdm(total=len(urls), desc="Đang cào dữ liệu")

        async def sem_scrape(url):
            async with semaphore:
                await scrape_page(browser, url, pbar)

        tasks = [sem_scrape(url) for url in urls]
        await asyncio.gather(*tasks)
        
        await browser.close()
        print(f"\n[*] HOÀN THÀNH! Dữ liệu đã được lưu vào thư mục '{OUTPUT_DIR}'")

if __name__ == "__main__":
    asyncio.run(main())
