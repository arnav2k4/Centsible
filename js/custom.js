(function () {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a.nav-link').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // get current year
    var year = new Date().getFullYear();
    document.querySelector("#currentYear").innerHTML = year;
})();


document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "b05abea4616642ba82d2404642f5d6fb";
    const apiUrl = `https://newsapi.org/v2/everything?q=finance-literacy&from=2025-02-18&to=2025-01-15&sortBy=popularity&apiKey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const blogContainer = document.querySelector(".blog-container");

            if (data.articles.length > 0) {
                data.articles.slice(0, 5).forEach(article => { // Get top 5 articles
                    const blogPost = document.createElement("div");
                    blogPost.classList.add("blog-post");

                    blogPost.innerHTML = `
                        <h4>${article.title}</h4>
                        <p>${article.description || "No description available."}</p>
                        <a href="${article.url}" target="_blank">Read More</a>
                    `;

                    blogContainer.appendChild(blogPost);
                });
            } else {
                blogContainer.innerHTML += "<p>No additional articles found.</p>";
            }
        })
        .catch(error => console.error("Error fetching blog data:", error));
});

