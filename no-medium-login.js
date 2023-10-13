async function getCacheFromGoogle() {
    const url = `https://webcache.googleusercontent.com/search?q=cache:${window.location.href}&strip=0&vwsrc=1`
    const response = await fetch(url)
    if (!response.ok) {
        return null
    }

    const decodedHTML = document.createElement("textarea")
    decodedHTML.innerHTML = await response.text()

    const parser = new DOMParser()
    const dom = parser.parseFromString(decodedHTML.value, "text/html")

    const doc = dom.querySelector("body > div > pre")
    if (!doc) {
        return null
    }
    
    return parser.parseFromString(doc.innerHTML, "text/html")
}

function getArticle(doc) {
    const selectors = [
        "article",
        "#main-content"
    ]

    for (const selector of selectors) {
        const article = doc.querySelector(selector)
        if (article) {
            return article
        }
    }

    return null
}

async function onDocumentLoaded() {
    const article = getArticle(document)
    if (!article) {
        console.log("No Medium Login: no article found" + window.location.href)
        return
    }

    const next = article.nextElementSibling
    if (!next) {
        console.log("No Medium Login: no next element found")
        return
    }

    next.style.display = "none"

    const cache = await getCacheFromGoogle()
    if (!cache) {
        console.log("No Medium Login: no cache found")
        return
    }

    var shadow = article.attachShadow({mode: "open"});
    cache.querySelectorAll("style").forEach(style => {
        shadow.appendChild(style)
    })

    const fullArticle = getArticle(cache)
    shadow.appendChild(fullArticle)
}

window.addEventListener("popstate", () => {
    onDocumentLoaded()
})

if (document.readyState === "complete") {
    onDocumentLoaded()
} else {
    window.addEventListener("DOMContentLoaded", onDocumentLoaded)
}
