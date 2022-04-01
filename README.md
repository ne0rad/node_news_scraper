
# Node News Scraper

A node.js Express api for scraping news from BBC

Keep in mind that request times depend on the internet connection of the machine you're running it from.



## API Reference

#### Request to get top technology news form BBC

```API
  GET http://localhost:8000/technology
```
Returns JSON document with top technology news from BBC.




## JSON result example

```javascript
{
    "data": [
        {
        "id": 0,
        "title": "Wind and solar now supply 10% of world electricity",
        "description": "Wind turbines and solar panels produced 10% of global electricity in 2021 but coal also had a resurgence.",
        "url": "https://www.bbc.co.uk/news/science-environment-60917445",
        "article": "Wind and solar generated 10% of global electricity for the first time in 2021, a new analysis shows."
        }
    ]
}
```


## Available Categories

Currently available categories for GET requests:

`/technology`

`/science`

`/business`

`/climate`
