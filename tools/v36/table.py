import json, sys
a = json.load(open(sys.argv[1])); b = json.load(open(sys.argv[2]))
W = ["360", "390", "768", "1024", "1440"]
print("| Genişlik | FCP V35.0 | FCP V36.0 | Kullanılabilir V35.0 | Kullanılabilir V36.0 | En uzun açılış görevi V35.0 | V36.0 | Bellek (JS heap) V35.0 | V36.0 |")
print("|---|---|---|---|---|---|---|---|---|")
for w in W:
    x, y = a[w], b[w]
    mx = lambda d: max([t[1] for t in d["nav"]["lt_load"]] or [0])
    print(f"| {w} | {x['nav']['fcp']} ms | {y['nav']['fcp']} ms | {x['nav']['ready']} ms | {y['nav']['ready']} ms | {mx(x)} ms | {mx(y)} ms | {x['heap_mb'][0]} MB | {y['heap_mb'][0]} MB |")
print()
T = list(a["360"]["tr"].keys())
print("| Geçiş | " + " | ".join(f"{w}: V35.0 → V36.0" for w in W) + " |")
print("|---|" + "---|" * len(W))
for t in T:
    print(f"| {t} | " + " | ".join(f"{a[w]['tr'][t]['ms']} → {b[w]['tr'][t]['ms']}" for w in W) + " |")
print()
print("| Kaydırma | " + " | ".join(W) + " |")
print("|---|" + "---|" * len(W))
print("| V35.0 ort./p95 (ms/kare) | " + " | ".join(f"{a[w]['scroll']['avg_ms']} / {a[w]['scroll']['p95_ms']}" for w in W) + " |")
print("| V36.0 ort./p95 (ms/kare) | " + " | ".join(f"{b[w]['scroll']['avg_ms']} / {b[w]['scroll']['p95_ms']}" for w in W) + " |")
