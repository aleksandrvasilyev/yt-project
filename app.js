import express from "express";
import youtubeDl from "youtube-dl-exec";

const app = express();

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/subtitles/:url", async (req, res) => {
  const url = decodeURIComponent(req.params.url);
  const { id, title, link } = await getSubtitlesLink(url);
  const linkContent = await fetchData(link);
  //   res.send(link);
  const subtitles = await getSubtitles(linkContent);
  res.send({ id, title, subtitles });
});

const linkIfEnLangExists = (arr, format = "json3") => {
  if (arr.en) {
    return arr.en.find((obj) => obj.ext === format).url;
  } else {
    const firstLang = Object.values(jsonData.subtitles)[0];
    return firstLang.find((obj) => obj.ext === format).url;
  }
};

const getSubtitlesLink = async (url) => {
  try {
    const data = await youtubeDl(url, {
      listSubs: true,
      dumpSingleJson: true,
      skipDownload: true,
    });

    // return data;
    const dataLines = data.split("\n");
    const jsonStartIndex = dataLines.findIndex((line) => line.startsWith("{"));

    if (jsonStartIndex !== -1) {
      const jsonString = dataLines.slice(jsonStartIndex).join("\n");
      const jsonData = JSON.parse(jsonString);

      let link;
      if (jsonData.subtitles && Object.keys(jsonData.subtitles).length > 0) {
        link = linkIfEnLangExists(jsonData.subtitles);
      } else if (jsonData.automatic_captions) {
        link = linkIfEnLangExists(jsonData.automatic_captions);
      } else {
        res.status(404).send("subtitles was not found");
      }
      const resultData = {
        id: jsonData.id,
        title: jsonData.title,
        link: link,
      };
      return resultData;
    } else {
      res.status(404).send("json was not found in the response");
    }
  } catch (error) {
    res.status(400).send("Error when executing youtube-dl");
  }
};

const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        "Error fetching data",
        response.status,
        response.statusText
      );
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

const getSubtitles = async (data) => {
  const events = data.events;

  let subtitles = "";

  events.forEach((line) => {
    if (line.segs) {
      line.segs.forEach((seg) => {
        if (seg.utf8) {
          subtitles += seg.utf8 + " ";
        }
      });
    }
  });

  return subtitles;
};

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
