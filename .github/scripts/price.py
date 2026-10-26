"""Reads the Tehran gold union board (estjt.ir) and writes price.json: 18k gram price in rial plus its update time."""
import html, json, re, sys, urllib.request
from datetime import datetime, timezone

FA = str.maketrans('۰۱۲۳۴۵۶۷۸۹', '0123456789')


def num(s):
    return int(re.sub(r'\D', '', s.translate(FA)) or 0)


req = urllib.request.Request('https://www.estjt.ir/', headers={'User-Agent': 'Mozilla/5.0 (leon-gold price check)'})
page = urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'replace')
text = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', page)))

m = re.search(r'طلا ۱۸ عیار ([۰-۹٫,]+)', text)
mz = re.search(r'مظنه تهران ([۰-۹٫,]+)', text)
up = re.search(r'آخرین بروزرسانی: ([^-]+) - ([۰-۹:]+)', text)
if not m:
    sys.exit('18k price not found on estjt.ir')

gp = num(m.group(1)) * 10  # the board is in toman
if not 1e7 < gp < 1e11:
    sys.exit('implausible price %d' % gp)

out = {
    'source': 'estjt',
    'gp': gp,
    'mazaneh': num(mz.group(1)) * 10 if mz else None,
    'day': up.group(1).strip() if up else '',
    'time': up.group(2).translate(FA)[:5] if up else '',
    'fetched': datetime.now(timezone.utc).isoformat(timespec='seconds'),
}
json.dump(out, open('price.json', 'w', encoding='utf-8'), ensure_ascii=False)
print(out)
