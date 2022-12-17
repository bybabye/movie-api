const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const url = "https://2embed.org/library";
const movie = "https://2embed.org/view/";

// SET UP
const app = express();

app.use(bodyParser.json({ limit: "50mb" }));

app.use(cors());
dotenv.config();

app.use(
  bodyParser.json({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// ROUTES
//function get

app.get("/v1", (req, resp) => {
  const limit = Number(req.query.limit); // chia page // 240 = 10 page => limit = [24,48,...240] <=> page1,page2,page3
  const thumbnails = []; //240 => 0 -> 239 // page 1 : limit = 23
  try {
    axios(url, {
      headers: { "Accept-Encoding": "gzip,deflate,compress" },
    }).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      $(".film-poster", html).each(function () {
        const image = $(this).find("img").attr("data-src");
        const link = $(this).find("a").attr("href");
        const imdb = link.split("/view/")[1];
        const url = 'https://movie-api-65n7.onrender.com/v1/' + imdb
        thumbnails.push({
          image,
          imdb,
          url,
        });
      });
      
      if (limit && limit > 0) {
        //
        let start = limit - 24;
    
        limit <= 24 ? resp.status(200).json(thumbnails.slice(0, limit)) :  resp.status(200).json(thumbnails.slice(start, limit - 1))
        
      } else {

        resp.status(200).json(thumbnails);
      }
    });
  } catch (error) {
    resp.status(500).json(err);
  }
});


app.get(`/v1/:character`, (req, resp) => {
  let url = movie + req.params.character;
  const thumbnails = [];
  try {
    axios(url, {
      headers: { "Accept-Encoding": "gzip,deflate,compress" },
    }).then((res) => {
      const html = res.data;
      
      const $ = cheerio.load(html);
      const name = $(".heading-large").text();
      const image = $('.film-poster').find('img').attr('src');
      const description = $(".description").text().trim();
      const film = `https://2embed.org/embed/movie?imdb=${req.params.character}`
      const titles = [];
      $('.row-line').each(function() {    
        const value = $(this).text().trim();
        titles.push(
            value
        )
      })
      thumbnails.push({ name , description ,titles,film,image });
      resp.status(200).json(thumbnails);
    });
  } catch (error) {
    resp.status(500).json(err);
  }
});

//Run port

app.listen(process.env.PORT || 8000, () => {
  console.log("server is running");
});
