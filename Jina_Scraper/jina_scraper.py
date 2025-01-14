import requests
import ollama

# ---------- Basic Setup ----------
# ollama.pull('llama2') # Run For Updates

# ---------- Basic Params ----------
structure = 'vox'
jina_key = 'r.jina.ai/'
url = "https://www.nbcnews.com/politics/donald-trump/trump-return-critics-skeptics-reconciling-new-normal-rcna186146"
# https://www.vox.com/culture/394583/conclave-megyn-kelly-backlash-catholicism-review
# https://www.cnn.com/2025/01/12/sport/ravens-steelers-nfl-wild-card/index.html
# https://en.wikipedia.org/wiki/Neil_Armstrong
# https://www.nbcnews.com/politics/donald-trump/trump-return-critics-skeptics-reconciling-new-normal-rcna186146
# https://r.jina.ai/www.vox.com/culture/394583/conclave-megyn-kelly-backlash-catholicism-review

# ---------- HTML Fetch Functionality ----------
def html_fetch(url):
    # Preparing Jina URL Site
    url = list(url)
    url.insert(8, jina_key)
    url = ''.join(url)

    # Scraping Site
    try:
        # GET's Page And Scrapes Site
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for HTTP errors (e.g., 404, 500)

        # Get the HTML content of the page
        scraped_content = response.text
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
    return scraped_content

# ---------- Data Cleanup Functionality ----------
def clean_content(content):
    i = 0

    while i < len(content):
        if content[i] == '[' or content[i] == ']':
            i_start = i
            while content[i] != ')' and i < len(content):
                i += 1
            content = content[0:i_start]+content[i+1:]
            i -= (i-i_start)
        else:
            i += 1
    return content

content = html_fetch(url)
content = clean_content(content)
fl = open('nbc_clean.txt', 'w', encoding='utf-8')
fl.write(content)
fl.close()