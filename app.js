const express = require('express');
const app = express()
const port = 8000
const morgan = require('morgan');
const puppeteer = require('puppeteer');

app.use(morgan('dev'));

const cache = {
  technology: {
    data: null,
    lastUpdated: null
  },
  business: {
    data: null,
    lastUpdated: null
  },
  science: {
    data: null,
    lastUpdated: null
  },
  climate: {
    data: null,
    lastUpdated: null
  }
};

const categories = {
  technology: 'https://www.bbc.co.uk/news/technology',
  business: 'https://www.bbc.co.uk/news/business',
  science: 'https://www.bbc.co.uk/news/science_and_environment',
  climate: 'https://www.bbc.co.uk/news/science-environment-56837908'
};

async function scrape(url) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
      timeout: 0
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto(url);

    const titles = await page.$$eval('.gs-c-promo-heading__title', els => els.map(el => el.innerText));
    const urls = await page.$$eval('.gs-c-promo-heading', els => els.map(el => el.href));
    const descriptions = await page.$$eval('.gs-c-promo-summary', els => els.map(el => el.innerText));

    const articles = [];

    for (let i = 0; i < descriptions.length; i++) {
      await page.goto(urls[i]);
      const allArticles = await page.$$eval('[data-component="text-block"]', els => els.map(el => el.innerText));
      const article = allArticles.join('\n\n');
      articles.push(article);
    }

    const data = [];

    descriptions.forEach((el, i) => {
      data.push({
        id: i,
        title: titles[i],
        description: el,
        url: urls[i],
        article: articles[i]
      })
    });

    await browser.close();
    return { data };
  } catch (err) {
    return { error: err };
  }
}

async function getData(category) {
  const now = new Date();
  const lastUpdated = cache[category].lastUpdated;
  const timeDiff = now - lastUpdated;
  const timeDiffInMinutes = timeDiff / 1000 / 60;

  if (timeDiffInMinutes > 30) {
    const result = await scrape(categories[category]);
    cache[category].data = result.data;
    cache[category].lastUpdated = now;
  }

  return cache[category].data;
}


app.get('/technology', async (req, res) => {
  const data = await getData('technology');
  res.send(data);
})

app.get('/science', async (req, res) => {
  const data = await getData('science');
  res.send(data);
})

app.get('/business', async (req, res) => {
  const data = await getData('business');
  res.send(data);
})

app.get('/climate', async (req, res) => {
  const data = await getData('climate');
  res.send(data);
})


app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
