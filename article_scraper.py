import requests
import ollama

# ---------- Basic Setup ----------
# ollama.pull('llama2') # Run For Updates

# ---------- Basic Params ----------
structure = 'vox'
url = "https://www.vox.com/culture/394583/conclave-megyn-kelly-backlash-catholicism-review"
# https://www.vox.com/culture/394583/conclave-megyn-kelly-backlash-catholicism-review
# https://www.cnn.com/2025/01/12/sport/ravens-steelers-nfl-wild-card/index.html
# https://en.wikipedia.org/wiki/Neil_Armstrong
# https://www.nbcnews.com/politics/donald-trump/trump-return-critics-skeptics-reconciling-new-normal-rcna186146
# https://r.jina.ai/www.vox.com/culture/394583/conclave-megyn-kelly-backlash-catholicism-review

# ---------- HTML Fetch Functionality ----------
def html_fetch(url):
    try:
        # Send a GET request to the webpage
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for HTTP errors (e.g., 404, 500)

        # Get the HTML content of the page
        html_content = response.text
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
    print(type(html_content))
    return html_content

# ---------- Get Structure Functionality ----------
def get_structure(html_content):
    html_content = html_content.split(' ')
    allowed_chrs = ['.',',','-','(',')','\'','\"']
    content = []
    for i in range(len(html_content)):
        print(i)
        valid = True
        # print(html_content[i])
        for c in html_content[i]:
            if not(c in allowed_chrs or c.isalpha()):
                # print(c)
                valid = False
                break
        if valid:
            content.append(html_content[i])
    content = " ".join(content)
    return content
html_content = html_fetch(url)
content = get_structure(html_content)
fl = open('html_cont2.txt', 'w', encoding='utf-8')
fl.write(content)
fl.close()
# " ' , . - ( ) 