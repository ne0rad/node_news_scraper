const express = require('express');
const app = express()
const port = 8000
const morgan = require('morgan');
const puppeteer = require('puppeteer');

app.use(morgan('dev'));


async function scrape(url) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    timeout: 0
  });
  const page = await browser.newPage();
  await page.goto(url);

  const titles = await page.$$eval('.gs-c-promo-heading__title', els => els.map(el => el.innerText));
  const urls = await page.$$eval('.gs-c-promo-heading', els => els.map(el => el.href));
  const descriptions = await page.$$eval('.gs-c-promo-summary', els => els.map(el => el.innerText));

  const articles = [];

  for (let i = 0; i < descriptions.length; i++) {
    const newPage = await browser.newPage();
    await newPage.goto(urls[i]);
    const allArticles = await newPage.$$eval('[data-component="text-block"]', els => els.map(el => el.innerText));
    const article = allArticles.join('\n\n');
    articles.push(article);
    await newPage.close();
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
}


app.get('/technology', async (req, res) => {
  const result = await scrape('https://www.bbc.co.uk/news/technology');
  res.json(result)
})

app.get('/science', async (req, res) => {
  const result = await scrape('https://www.bbc.co.uk/news/science_and_environment');
  res.json(result)
})

app.get('/politics', async (req, res) => {
  const result = await scrape('https://www.bbc.co.uk/news/politics');
  res.json(result)
})

app.get('/business', async (req, res) => {
  const result = await scrape('https://www.bbc.co.uk/news/business');
  res.json(result)
})

app.get('/climate', async (req, res) => {
  const result = await scrape('https://www.bbc.co.uk/news/science-environment-56837908');
  res.json(result)
})


app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
