import os
import re

def patch_files():
    files = [f for f in os.listdir('.') if (f.startswith('learn') and f.endswith('.html')) or f == 'client.html']
    
    script_inject = '<script src="config.js"></script>\n'
    
    for filename in files:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Inject config.js if not present
        if 'config.js' not in content:
            content = content.replace('</head>', f'  {script_inject}</head>')

        # 2. Replace hardcoded localhost 8080
        # Handles single quotes, double quotes, and backticks
        content = re.sub(r"(['\"`])ws://localhost:8080([^'\"`]*)(['\"`])", r"getWsUrl(8080) + \1\2\3", content)
        
        # 3. Handle cases where it was just the string 'ws://localhost:8080' and we want to replace the whole thing with getWsUrl(8080)
        # The above regex might result in getWsUrl(8080) + '' if it's just the URL.
        # Let's refine:
        content = content.replace("getWsUrl(8080) + ''", "getWsUrl(8080)")
        content = content.replace('getWsUrl(8080) + ""', "getWsUrl(8080)")
        content = content.replace("getWsUrl(8080) + ``", "getWsUrl(8080)")

        # 4. Same for 8081
        content = re.sub(r"(['\"`])ws://localhost:8081([^'\"`]*)(['\"`])", r"getWsUrl(8081) + \1\2\3", content)
        content = content.replace("getWsUrl(8081) + ''", "getWsUrl(8081)")
        content = content.replace('getWsUrl(8081) + ""', "getWsUrl(8081)")
        content = content.replace("getWsUrl(8081) + ``", "getWsUrl(8081)")

        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {filename}")

if __name__ == "__main__":
    patch_files()
