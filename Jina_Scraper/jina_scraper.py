import requests
import ollama

# ---------- Basic Setup ----------
# ollama.pull('llama2') # Run For Updates

# ---------- Basic Params ----------
structure = 'vox'
jina_key = 'r.jina.ai/'
url = "https://www.cnn.com/2025/01/12/sport/ravens-steelers-nfl-wild-card/index.html"
# https://www.vox.com/culture/394583/conclave-megyn-kelly-backlash-catholicism-review
# https://www.cnn.com/2025/01/12/sport/ravens-steelers-nfl-wild-card/index.html
# https://en.wikipedia.org/wiki/Neil_Armstrong
# https://www.nbcnews.com/politics/donald-trump/trump-return-critics-skeptics-reconciling-new-normal-rcna186146
# https://r.jina.ai/www.vox.com/culture/394583/conclave-megyn-kelly-backlash-catholicism-review

# ---------- HTML Fetch Functionality ----------
def html_fetch(url):
    # Scraping Site
    url = list(url).insert()
    try:
        # GET's Page And Scrapes Site
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for HTTP errors (e.g., 404, 500)

        # Get the HTML content of the page
        html_content = response.text
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
    return html_content

# ---------- Data Cleanup Functionality ----------
