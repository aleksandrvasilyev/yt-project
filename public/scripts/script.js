const getSubtitles = () => {
  const submitButton = document.getElementById("submit-button");
  const searchInput = document.getElementById("search-input");

  submitButton.addEventListener("click", async () => {
    const url = encodeURIComponent(searchInput.value);
    // console.log(url);
    showLoadingAnimation();

    try {
      const response = await fetch(`http://localhost:3005/subtitles/${url}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Error fetching the data");
      }

      const data = await response.json();
      showSubtitles(data);
      //   console.log(data);
    } catch (error) {
      console.log(error);
    }
  });
};

const showLoadingAnimation = () => {
  const subtitlesElement = document.getElementById("subtitles");
  subtitlesElement.innerHTML = `<div class="flex justify-center"><img src="./img/loading.gif" alt="loading"></div>`;
};

const showSubtitles = (data) => {
  const subtitlesElement = document.getElementById("subtitles");
  //   console.log(data);
  subtitlesElement.innerHTML = `
    <p>${data.title}</p>
    <p>${data.subtitles}</p>
  `;
};

const main = () => {
  getSubtitles();
};

window.onload = () => {
  main();
};
