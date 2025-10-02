let pagesData = [];
let flatPages = [];
let currentIndex = 0;

async function initDocs() {
  const res = await fetch("pages.json");
  pagesData = await res.json();

  buildSidebar();
  flattenPages();
  const pageFromHash = location.hash.slice(1);
  const firstPage = flatPages[0].path;
  loadPage(pageFromHash || firstPage);
}

function buildSidebar() {
  const nav = document.getElementById("sidebar-nav");
  const ul = document.createElement("ul");

  pagesData.forEach(group => {
    const liGroup = document.createElement("li");
    const groupTitle = document.createElement("div");
    groupTitle.textContent = group.label;
    groupTitle.style.fontWeight = "bold";
    liGroup.appendChild(groupTitle);

    const ulPages = document.createElement("ul");
    group.pages.forEach(page => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${page.path}`;
      a.textContent = page.label;
      li.appendChild(a);
      ulPages.appendChild(li);
    });

    liGroup.appendChild(ulPages);
    ul.appendChild(liGroup);
  });

  nav.appendChild(ul);
}

function flattenPages() {
  pagesData.forEach(group => {
    group.pages.forEach(p => {
      flatPages.push(p);
    });
  });
}

async function loadPage(path) {
  const index = flatPages.findIndex(p => p.path === path);
  if (index === -1) return;

  currentIndex = index;
  const page = flatPages[index];

  // Update content
  const res = await fetch(path);
  const text = await res.text();
  document.getElementById("page-title").textContent = page.label;
  document.getElementById("page-content").innerHTML = marked.parse(text);

  // Update active link
  document.querySelectorAll("#sidebar-nav a").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === `#${path}`);
  });

  // Update footer nav
  updateFooter();

  // Update tab title
  document.title = `${page.label} – MyDocs`;

  // Update URL hash
  location.hash = path;
}

function updateFooter() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  if (currentIndex > 0) {
    prevBtn.disabled = false;
    prevBtn.textContent = `⬅ ${flatPages[currentIndex - 1].label}`;
    prevBtn.onclick = () => loadPage(flatPages[currentIndex - 1].path);
  } else {
    prevBtn.disabled = true;
  }

  if (currentIndex < flatPages.length - 1) {
    nextBtn.disabled = false;
    nextBtn.textContent = `${flatPages[currentIndex + 1].label} ➡`;
    nextBtn.onclick = () => loadPage(flatPages[currentIndex + 1].path);
  } else {
    nextBtn.disabled = true;
  }
}

window.addEventListener("hashchange", () => {
  const path = location.hash.slice(1);
  if (path) loadPage(path);
});

initDocs();
