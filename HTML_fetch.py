import requests

# URL of the webpage
url = "https://www.vox.com/culture/394583/conclave-megyn-kelly-backlash-catholicism-review"

try:
    # Send a GET request to the webpage
    response = requests.get(url)
    response.raise_for_status()  # Raise an error for HTTP errors (e.g., 404, 500)

    # Get the HTML content of the page
    html_content = response.text

    # Print the HTML content
    print(html_content)
    if 'itself.' in html_content:
        print('yes')

except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")
