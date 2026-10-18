import json, os, re, sys, glob, difflib, subprocess, time, urllib.request

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LESSONS = os.path.join(REPO, "src/db/content/lessons")
PUBLIC = os.path.join(REPO, "public")
VOICE = "G1HOkzin3NMwRHSq60UI"
KEY = os.environ["ELEVENLABS_API_KEY"]

def phrase_blocks(blocks):
    for b in blocks:
        if "phrase" in b:
            yield b["phrase"]
        if "more" in b:
            yield from phrase_blocks(b["more"].get("blocks", []))

def plan():
    jobs, quran = [], set()
    for f in sorted(glob.glob(os.path.join(LESSONS, "*.json"))):
        lesson = json.load(open(f))
        slug = lesson["slug"]
        seen = {}
        for lang in ("en", "ar", "es"):
            for p in phrase_blocks(lesson.get("body", {}).get(lang, [])):
                audio = p.get("audio")
                if audio:
                    for a in ([audio] if isinstance(audio, str) else audio):
                        if a.startswith("/audio/quran/"):
                            quran.add(a)
                    continue
                if p["arabic"] not in seen:
                    seen[p["arabic"]] = None
        for i, arabic in enumerate(seen, 1):
            jobs.append((slug, f"/audio/phrases/{slug}-{i}.mp3", arabic))
    return jobs, sorted(quran)

def normalize(text):
    text = text.replace("\u0670", "ا")
    text = re.sub(r"[ؐ-ًؚ-ٰٟۖ-ۭـ]", "", text)
    text = re.sub(r"[ٱأإآ]", "ا", text).replace("ى", "ي").replace("ة", "ه")
    text = re.sub(r"[^ء-ي ]", " ", text)
    return " ".join(text.split())

def tts(arabic, out):
    body = json.dumps({"text": arabic, "model_id": "eleven_v3", "language_code": "ar", "voice_settings": {"stability": 0.5}}).encode()
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_96", data=body, headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r, open(out, "wb") as fh:
        fh.write(r.read())

def stt(path):
    out = subprocess.run(["curl", "-s", "-X", "POST", "https://api.elevenlabs.io/v1/speech-to-text", "-H", f"xi-api-key: {KEY}", "-F", "model_id=scribe_v1", "-F", "language_code=ara", "-F", f"file=@{path}"], capture_output=True, text=True).stdout
    try:
        return json.loads(out).get("text", "")
    except Exception:
        return ""

def attach(jobs):
    by_slug = {}
    for slug, path, arabic in jobs:
        by_slug.setdefault(slug, {})[arabic] = path
    for slug, mapping in by_slug.items():
        f = os.path.join(LESSONS, f"{slug}.json")
        lesson = json.load(open(f))
        for lang in ("en", "ar", "es"):
            for p in phrase_blocks(lesson.get("body", {}).get(lang, [])):
                if not p.get("audio") and p["arabic"] in mapping:
                    p["audio"] = mapping[p["arabic"]]
        with open(f, "w") as fh:
            json.dump(lesson, fh, ensure_ascii=False, indent=2)
            fh.write("\n")

if __name__ == "__main__":
    cmd = sys.argv[1]
    jobs, quran = plan()
    if cmd == "list":
        for j in jobs:
            print(j[1], "|", j[2])
        print(len(jobs), "phrases;", len(quran), "quran files")
    elif cmd == "quran":
        os.makedirs(os.path.join(PUBLIC, "audio/quran"), exist_ok=True)
        for a in quran:
            dest = os.path.join(PUBLIC, a.lstrip("/"))
            if not os.path.exists(dest):
                urllib.request.urlretrieve(f"https://everyayah.com/data/Alafasy_64kbps/{os.path.basename(a)}", dest)
            print(a, os.path.getsize(dest))
    elif cmd == "generate":
        skip = set(sys.argv[2:])
        os.makedirs(os.path.join(PUBLIC, "audio/phrases"), exist_ok=True)
        report = []
        done = []
        for slug, path, arabic in jobs:
            if path in skip:
                continue
            dest = os.path.join(PUBLIC, path.lstrip("/"))
            score = 0
            for attempt in range(3):
                if not os.path.exists(dest) or attempt > 0:
                    tts(arabic, dest)
                heard = stt(dest)
                score = difflib.SequenceMatcher(None, normalize(arabic), normalize(heard)).ratio()
                if score >= 0.9:
                    break
            report.append((round(score, 2), path, normalize(arabic), normalize(heard)))
            done.append((slug, path, arabic))
        attach(done)
        for r in sorted(report):
            print(*r, sep=" | ")
