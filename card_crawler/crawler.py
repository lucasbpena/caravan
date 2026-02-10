import requests
from bs4 import BeautifulSoup

import os

domain = 'https://cardscans.piwigo.com/'
base_url = 'https://cardscans.piwigo.com/picture?/'

decks_urls = {
    1800: {'url': '/category/412-bicycle_1800', 'start': str(23030), 'end': str(23084)}
}


def get_deck(deck_id):
    deck = decks_urls[deck_id]
    url = deck['url']
    start = int(deck['start'])
    end = int(deck['end'])

    for i in range(start, end + 1):
        print(f'Getting image URL for card {i} from {url}')
        
        r = requests.get(base_url + str(i) + url)
        soup = BeautifulSoup(r.text, 'html.parser')
        # Find image data URL in img w/ id 'theMainImage'
        img_data_url = soup.find('img', {'id': 'theMainImage'})['src']

        img_url = domain + img_data_url[1:]
        img_data = requests.get(img_url).content
        with open(f'1800_{i}.jpg', 'wb') as handler:
            handler.write(img_data)


get_deck(1800)