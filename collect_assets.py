import requests, concurrent.futures, json
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from pathlib import Path

pages = {
 'bobo':'https://bobochoses.com/',
 'mini':'https://www.minirodini.com/us',
 'oeuf':'https://oeufnyc.com/',
 'stapelstein':'https://stapelstein.com/',
 'oli':'https://oliandcarol.com/',
 'liewood':'https://www.liewood.com/',
 'konges':'https://kongessloejd.com/',
 'nobodinoz':'https://nobodinoz.com/'
}
def inspect(item):
 key,url=item
 try:
  r=requests.get(url,timeout=35);r.raise_for_status()
  soup=BeautifulSoup(r.text,'html.parser')
  out=[]
  for img in soup.find_all('img'):
   src=img.get('src') or img.get('data-src')
   if src and not src.startswith('data:'):
    out.append({'src':urljoin(r.url,src),'alt':img.get('alt',''),'w':img.get('width'),'h':img.get('height')})
  for meta in soup.select('meta[property="og:image"]'):
   out.append({'src':urljoin(r.url,meta.get('content','')),'alt':'OG image'})
  return key,{'url':r.url,'images':out}
 except Exception as e:return key,{'error':str(e)}
results=dict(concurrent.futures.ThreadPoolExecutor(8).map(inspect,pages.items()))
Path('research-assets.json').write_text(json.dumps(results,indent=2))
for key,data in results.items():
 print(key, data.get('error',''),json.dumps(data.get('images',[])[-18:]))
