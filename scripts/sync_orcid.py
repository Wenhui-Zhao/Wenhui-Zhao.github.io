import json, os, requests
ORCID_ID = os.environ.get("ORCID_ID")
CID = os.environ.get("ORCID_CLIENT_ID")
CSECRET = os.environ.get("ORCID_CLIENT_SECRET")
DATA_FILE = os.path.join("data", "publications.json")
def get_token(cid, csecret):
    r = requests.post("https://orcid.org/oauth/token", data={
        "client_id": cid, "client_secret": csecret, "grant_type": "client_credentials", "scope": "/read-public"
    }, headers={"Accept":"application/json"}, timeout=30)
    r.raise_for_status(); return r.json()["access_token"]
def get_record(orcid_id, token):
    r = requests.get(f"https://api.orcid.org/v3.0/{orcid_id}/record",
        headers={"Accept":"application/vnd.orcid+json","Authorization":f"Bearer {token}"}, timeout=30)
    r.raise_for_status(); return r.json()
def parse_works(rec):
    out=[]
    groups=((rec.get("activities-summary") or {}).get("works") or {}).get("group",[]) or []
    for g in groups:
        for s in g.get("work-summary",[]) or []:
            title=((s.get("title") or {}).get("title") or {}).get("value")
            if not title: continue
            y=None
            if s.get("publication-date"): y=(s["publication-date"].get("year") or {}).get("value")
            journal=(s.get("journal-title") or {}).get("value")
            doi=None; url=None
            for eid in (s.get("external-ids",{}) or {}).get("external-id",[]) or []:
                t=(eid.get("external-id-type") or "").lower()
                if t=="doi": 
                    v=(eid.get("external-id-value") or "")
                    v=v.replace("https://doi.org/","").replace("doi:","").strip()
                    doi=v
                if not url and (eid.get("external-id-url") or {}).get("value"):
                    url=eid["external-id-url"]["value"]
            out.append({
                "year": int(y) if y else None, "authors": None, "title": title, "journal": journal or "",
                "volume":"", "issue":"", "pages":"", "doi": doi or "", "link": (f"https://doi.org/{doi}" if doi else (url or "")), "type":"Work"
            })
    # dedupe
    seen=set(); uniq=[]
    for w in out:
        k=(w["title"], w["year"])
        if k in seen: continue
        seen.add(k); uniq.append(w)
    return uniq
def merge(manual, pulled):
    keys={(m.get("title"),m.get("year")) for m in manual}
    merged=manual[:]
    for p in pulled:
        if (p.get("title"), p.get("year")) not in keys:
            merged.append(p)
    merged.sort(key=lambda x:(x.get("year") or 0), reverse=True)
    return merged
def main():
    manual=[]
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE,"r",encoding="utf-8") as f: manual=json.load(f)
    if not (ORCID_ID and CID and CSECRET):
        print("Missing ORCID env vars; skipping."); return
    tok=get_token(CID, CSECRET); rec=get_record(ORCID_ID, tok); pulled=parse_works(rec)
    merged=merge(manual, pulled)
    with open(DATA_FILE,"w",encoding="utf-8") as f: json.dump(merged,f,ensure_ascii=False,indent=2)
if __name__=="__main__": main()
