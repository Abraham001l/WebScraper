import requests
import ollama

# ---------- Basic Setup ----------
# ollama.pull('llama2') # Run For Updates

# ---------- Basic Params ----------
structure = 'vox'
url = "https://www.cnn.com/2025/01/12/sport/ravens-steelers-nfl-wild-card/index.html"
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
    return html_content

# ---------- Data Extraction Functionality ----------
def level0_check(section):
    # Returns True if Valid
    return len(section) > 0

def level1_check(c):
    general_chrs = ['.',',',"'",'"','’','-','—'] # Plus leters
    # "-" Removed Due To Complexity

    # Returns True If Valid
    return (c in general_chrs or c.isalpha())

def level2_check(c, section):
    # Char's Only Allowed At The End
    end_chars = ['.',',']

    # Returns True If Valid
    return (c == section[len(section)-1] and c in end_chars) or (not (c in end_chars))


def validity_checker(section):
    # Passing Section Through Validity Check Levels
    valid = level0_check(section)
    for c in section:
        if not (level1_check(c) and level2_check(c, section)):
            valid = False
            break
    return valid

def add_ends(last_valid, cur_valid, html_content, i, content):
    valid_end_chrs = ['’'] # Plus Letters

    # Checking Where to Add End
    if last_valid == False and cur_valid == True:
        # Avoiding Out Of Bounds Error
        if i-1 > -1:
            # Append Back
            end = []
            section = html_content[i-1]
            c = len(section)-1
            while c > -1:
                cur_chr = section[c]
                if cur_chr in valid_end_chrs or cur_chr.isalpha():
                    end.append(cur_chr)
                else:
                    break
                c -= 1
            end.reverse()
            end = ''.join(end)
            content[i:i] = end
    elif last_valid == True and cur_valid == False:
        # Append Front
        end = []
        section = html_content[i]
        c = 0
        while c < len(section):
            cur_chr = section[c]
            if cur_chr in valid_end_chrs or cur_chr.isalpha():
                end.append(cur_chr)
            else:
                break
            c += 1
        end = ''.join(end)
        content.append(f'{end}\n')
        
# def parse_html(html_content):
#     # Splitting HTML Content
#     html_content = html_content.split(' ')
#     content = []
#     last_valid = False

#     # Looping Through Whole HTML
#     for i in range(len(html_content)):

#         # Checking Section of HTML
#         valid = validity_checker(html_content[i])

#         # Appending Valid Data
#         if valid:
#             content.append(html_content[i].strip())
#         add_ends(last_valid, valid, html_content, i, content)
#         last_valid = valid
#     content = " ".join(content)
#     return content

def window_end_check(section):
    i = 0
    valid_chrs = ["'",'’'] # And Letters
    if len(section) > 0:
        while i < len(section):
            if not (section[i] in valid_chrs or section[i].isalpha()):
                break
            if i == len(section)-1:
                break
            i += 1
        if section[i] == '.':
            return True, i
    return False, None

def window_parser(html_content, i):
    # Creating Window
    window = [html_content[i]]
    i += 1
    add_window = False
    
    while i < len(html_content):
        # Runs Through Validity Checker
        valid = validity_checker(html_content[i])

        if valid:
            window.append(html_content[i])
        else:
            print(html_content[i])
            end_one, i_one = window_end_check(html_content[i])
            end_minus_one, _ = window_end_check(html_content[i-1])
            if end_minus_one:
                return window, i+1
            elif end_one:
                window.append(html_content[i][0:i_one+1])
                return window, i+1
            else:
                return None, i+1
        i += 1

def parse_html(html_content):
    # Splitting HTML Content
    html_content = html_content.split(' ')
    valid_content = []
    i = 0

    while i < len(html_content):

        # Checking Section of HTML
        valid = validity_checker(html_content[i])

        # Expanding Window If Valid
        if valid:
            window, window_end_i = window_parser(html_content, i)
            if window:
                valid_content.append(' '.join(window))
            i = window_end_i
        else:
            i += 1
    valid_content = "\n".join(valid_content)
    return valid_content

html_content = html_fetch(url)
content = parse_html(html_content)
fl = open('cnn_out.txt', 'w', encoding='utf-8')
fl.write(content)
fl.close()
# " ' , . - ( ) 