import concurrent.futures, io, json, subprocess
from pathlib import Path
import requests
from PIL import Image,ImageOps,ImageDraw

root=Path(__file__).parent
records=[]
for source in ['research-care.json','research-teen.json']:
    for brand in json.loads((root/source).read_text())['brands']:
        for number,img in enumerate(brand['images']):
            records.append({'file':f"{brand['id']}-{number}.jpg",'brand':brand['id'],'url':img['url'],'page':img['sourcePage']})

def download(record):
    response=requests.get(record['url'],timeout=45);response.raise_for_status()
    image=ImageOps.exif_transpose(Image.open(io.BytesIO(response.content))).convert('RGBA')
    image.thumbnail((1600,1600))
    background=Image.new('RGBA',image.size,'#f2f2f0');background.alpha_composite(image)
    destination=root/'dist/assets'/record['file']
    background.convert('RGB').save(destination,quality=90)
    record['size']=list(image.size)
    result=subprocess.run(['/Users/adityasangal/.codex/skills/impeccable/scripts/impeccable','embed-prompt',str(destination),'--prompt',f"Sourced official brand image. Original: {record['url']} | Source page: {record['page']} | Resized for a local brand strategy study. Copyright remains with the respective owner."],capture_output=True,text=True)
    if result.returncode:raise RuntimeError(result.stderr)
    return record

new=list(concurrent.futures.ThreadPoolExecutor(6).map(download,records))
provenance_path=root/'asset-provenance.json'
old=json.loads(provenance_path.read_text());names={r['file'] for r in new}
all_records=[r for r in old if r['file'] not in names]+new
provenance_path.write_text(json.dumps(all_records,indent=2))
(root/'dist/credits.js').write_text('export const credits = '+json.dumps({r['file']:r['url'] for r in all_records},indent=2)+';\n')
sheet=Image.new('RGB',(1250,1800),'#f2f2f0');draw=ImageDraw.Draw(sheet)
for i,r in enumerate(new):
    image=Image.open(root/'dist/assets'/r['file']);image=ImageOps.contain(image,(230,260))
    x=(i%5)*250;y=(i//5)*300
    sheet.paste(image,(x+(230-image.width)//2,y+(260-image.height)//2));draw.text((x+5,y+266),r['file'],fill='#20221f')
(root/'.impeccable/review/extension').mkdir(parents=True,exist_ok=True)
sheet.save(root/'.impeccable/review/extension/asset-sheet.jpg')
print(f"Downloaded {len(new)} images; {len(all_records)} total image credits.")
