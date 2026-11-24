#!/bin/bash
# Builds the installable app folder from the single-file source. Usage: build.sh <src.html> <outdir>
set -e
SRC="$1"; OUT="$2"; HERE="$(cd "$(dirname "$0")" && pwd)"; CCB="$(dirname "$SRC")"
mkdir -p "$OUT/fonts" "$OUT/vendor" "$OUT/icons"
cp "$CCB"/fonts/*.ttf "$OUT/fonts/"; cp "$CCB"/vendor/*.js "$OUT/vendor/"
[ -f "$OUT/icons/icon-512.png" ] || node "$HERE/icons.js" "$HERE/icon.svg" "$OUT/icons"
[ -f "$OUT/firebase-config.js" ] || printf '// Firebase project settings for sync. Empty = songs stay on each device.\nwindow.CCB_FIREBASE = null;\n' > "$OUT/firebase-config.js"
VER=$(cat "$SRC" "$CCB"/vendor/*.js "$OUT/firebase-config.js" | sha1sum | cut -c1-10)
python3 - "$SRC" "$OUT" "$VER" <<'PY'
import sys
src, out, ver = sys.argv[1:4]
body = open(src).read()
head = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#1C4FD6">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Chord Charts">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<script src="firebase-config.js"></script>
<style>html,body{margin:0;padding:0}*,*::before,*::after{box-sizing:border-box}</style>
'''
tail = '''
<script>
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  navigator.serviceWorker.register("sw.js").then(function (reg) {
    reg.addEventListener("updatefound", function () {
      var w = reg.installing; if (!w) return;
      w.addEventListener("statechange", function () {
        if (w.state === "installed" && navigator.serviceWorker.controller) {
          var t = document.getElementById("toastMsg"), box = document.getElementById("toast");
          if (t && box) { t.textContent = "A new version is ready. Close and reopen the app to use it."; box.hidden = false; }
        }
      });
    });
  }).catch(function () {});
}
</script>
</body>
</html>
'''
# The source opens with <title>, links and one <style>; those go in <head>, the rest is the body.
j = body.index('</style>') + len('</style>')
page = head + body[:j] + '\n</head>\n<body>\n' + body[j:] + tail
open(out + '/index.html', 'w').write(page)
PY
sed "s/__VERSION__/$VER/" "$HERE/sw.template.js" > "$OUT/sw.js"
cp "$HERE/manifest.webmanifest" "$OUT/"
cp "$HERE/README.md" "$OUT/" 2>/dev/null || true
touch "$OUT/.nojekyll"
echo "built $OUT version $VER"
