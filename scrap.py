import requests
from bs4 import BeautifulSoup
import json

# Step 1: Request the website content
url = 'https://www.impactanalytics.co/'
response = requests.get(url)

# Step 2: Parse the website HTML content
soup = BeautifulSoup(response.text, 'html.parser')

# Step 3: Extract and structure relevant data from the website
data = {
    "headlines": [],
    "descriptions": [],
    "services": [],
    "testimonials": []
}

# Extracting headlines and event titles (typically in <h1>, <h2>, <h3>)
for para in soup.find_all(['h1', 'h2', 'h3']):
    text = para.get_text().strip()
    if text:
        data["headlines"].append(text)

# Extracting descriptions (typically in <p> or other descriptive tags)
for para in soup.find_all(['p']):
    text = para.get_text().strip()
    if text and len(text.split()) > 5:  # Ensure it's not just small text or empty
        data["descriptions"].append(text)

# Extracting service-related content (checking specific keywords from the site)
keywords_services = ["Demand Planning", "Supply Chain", "Merchandising", "Pricing & Promotions", "Business Intelligence"]
for keyword in keywords_services:
    if keyword.lower() in response.text.lower():
        data["services"].append(keyword)

# Extracting customer testimonials and quotes (likely in <blockquote>, <p>, etc.)
for para in soup.find_all('p'):
    text = para.get_text().strip()
    if "helped us" in text or "solution" in text:
        if text:
            data["testimonials"].append(text)

# Step 4: Store data in a JSON file
with open('structured_website_data.json', 'w') as file:
    json.dump(data, file, indent=4)

print('Data scraping complete. Data saved in structured_website_data.json')
