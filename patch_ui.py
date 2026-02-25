import os
import re

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Aggressively replace the URL string inside any single/double quoted string
    # Find: "something ws://localhost:8080 something"
    # Replace: "something " + getWsUrl(8080) + " something"
    
    # Pattern for ws://localhost:PORT inside a string
    url_pattern = r"(['\"])(.*?)ws://localhost:(\d+)(.*?)(['\"])"
    
    def replacer(match):
        q_start = match.group(1)
        prefix = match.group(2)
        port = match.group(3)
        suffix = match.group(4)
        q_end = match.group(5)
        
        # If there's prefix/suffix, we need to split the string
        result = ""
        if prefix:
            result += f"{q_start}{prefix}{q_start} + "
        result += f"getWsUrl({port})"
        if suffix:
            result += f" + {q_end}{suffix}{q_end}"
        return result

    new_content = re.sub(url_pattern, replacer, content)

    # Also handle the case where it's JUST the URL: new WebSocket('ws://localhost:8080')
    # which the above might already handle but let's be safe
    ws_pattern = r"new WebSocket\(['\"]ws://localhost:(\d+)['\"]\)"
    new_content = re.sub(ws_pattern, r"new WebSocket(getWsUrl(\1))", new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

# Patch all learn*.html files and client.html
patched_count = 0
for filename in os.listdir('.'):
    if filename.startswith('learn') and filename.endswith('.html') or filename == 'client.html':
        if patch_file(filename):
            print(f"Patched {filename}")
            patched_count += 1

print(f"Total files patched: {patched_count}")
