import requests,json,concurrent.futures,re,io
from pathlib import Path
from PIL import Image
data=json.load(open('research-assets.json'))
def find(k,s):return next(x['src'] for x in data[k]['images'] if s in x['src'])
sources={
 'bobo': ['https://bobochoses.com/cdn/shop/files/ICONIC_2024_CAMPAIGN3221.png?v=1727093414&width=1100',find('bobo','AW26_All_About_Monsters')],
 'mini':[find('mini','3x4_jacket'),find('mini','3x4_sweatshirt')],
 'oeuf':[find('oeuf','Moss-Table-Chairs_01'),find('oeuf','20230429_KateJordan')],
 'stapelstein':[find('stapelstein','Stapelstein-Outdoor-Original-rainbow-pastel-78').replace('http:','https:'),find('stapelstein','Original-rainbow-classic-shadow-s_1')],
 'oli':[find('oli','oli-and-carol-baby-gift-sets'),find('oli','oli-and-carol-baby-teethers')],
 'liewood':[find('liewood','LIEWOOD_1-26_Sellin_94110_3'),find('liewood','Mealtime_NAV')],
 'konges':[find('konges','MOOD_KS106430'),find('konges','FLAT_KS4206')],
 'nobodinoz':[find('nobodinoz','Heju-junior-bed'),find('nobodinoz','Growing-green-kid-table-colored-baltic-blue-nobodinoz-2')]
}
def download(task):
 k,i,url=task
 url=re.sub(r'width=\d+','width=1200',url)
 url=re.sub(r'/m/1920x2560','/m/1050x1400',url)
 r=requests.get(url,timeout=45);r.raise_for_status()
 img=Image.open(io.BytesIO(r.content)).convert('RGB');img.thumbnail((1600,1600))
 name=f'{k}-{i}.jpg';img.save(Path('dist/assets')/name,quality=88)
 return {'file':name,'url':url,'page':data[k]['url'],'brand':k,'size':img.size}
out=list(concurrent.futures.ThreadPoolExecutor(8).map(download,[(k,i,u) for k,urls in sources.items() for i,u in enumerate(urls)]))
Path('asset-provenance.json').write_text(json.dumps(out,indent=2))
print(json.dumps(out,indent=2))
